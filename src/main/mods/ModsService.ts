import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import * as path from 'path'
import { APP_NAME } from '../../connector/shared/Constants'
import { wait } from '../../connector/shared/engine/Debounce'
import { clamp } from '../../connector/shared/Math'
import { getResourcePath } from '../../connector/shared/ResourcePath'
import { BitwigService } from '../bitwig/BitwigService'
import { buildModsPath } from '../config'
import { createDirIfNotExist, exists as fileExists, writeStrFile } from '../core/Files'
import { lockpickFileLogger, logger } from '../core/Log'
import { BESService, getService, makeEvent } from '../core/Service'
import { SettingsService } from '../core/SettingsService'
import {
  addAPIMethod,
  interceptPacket,
  sendPacketToBitwig,
  sendPacketToBrowser,
  SocketMiddlemanService,
} from '../core/WebsocketToSocket'
import { getDb } from '../db'
import { Setting } from '../db/entities/Setting'
import { PopupService } from '../popup/PopupService'
import { ShortcutsService } from '../shortcuts/ShortcutsService'
import { UIService } from '../ui/UIService'
import copyControllerScript from './helpers/copyControllerScript'
import getModsWithInfo from './helpers/getModsWithInfo'
import { CueMarker, Device, ModInfo, SettingInfo } from './ModInfo'
import getModsFolderPaths from './helpers/getModsFolderPaths'
import winston = require('winston')
import glob = require('glob')
import isBuiltInModule = require('is-builtin-module')
import getModApi from './helpers/getModApi'
const chokidar = require('chokidar')
const colors = require('colors')
const { app } = require('electron')

let nextId = 0
let modsLoading = false

const { Keyboard, Mouse, MainWindow, Bitwig, UI } = require('bindings')('bes')

export class ModsService extends BESService {
  // Services
  settingsService = getService(SettingsService)
  shortcutsService = getService(ShortcutsService)
  suckitService = getService(SocketMiddlemanService)
  uiService = getService(UIService)
  bitwigService = getService(BitwigService)
  popupService = getService(PopupService)

  isQuitting = false

  // Internal state
  currProject: string | null = null
  currTrack: any | null = null
  cueMarkers: CueMarker[] = []
  currDevice: Device | null = null
  folderWatcher?: any
  controllerScriptFolderWatcher?: any

  /**
   * Includes every mod found during search, even those that are disabled
   */
  latestFoundModsMap: { [name: string]: Partial<ModInfo> } = {}

  onReloadMods: Function[] = []
  refreshCount = 0
  activeEngineProject: string | null = null
  activeModApiIds: { [key: string]: any } = {}
  settingKeyInfo: { [key: string]: SettingInfo } = {}

  // Events
  events = {
    selectedTrackChanged: makeEvent<any>(),
    cueMarkersChanged: makeEvent<any>(),
    projectChanged: makeEvent<number>(),
    modsReloaded: makeEvent<void>(),
    activeEngineProjectChanged: makeEvent<string>(),
  }

  get simplifiedProjectName() {
    if (!this.currProject) {
      return null
    }
    return this.currProject
      .split(/v[0-9]+/)[0]
      .trim()
      .toLowerCase()
  }

  lastLogMsg = ''
  sameMessageCount = 0
  waitingMessagesByModId: {
    [modId: string]: { msg: string; count: number }[]
  } = {}

  logForMod(modId: string, level: string, ...args: any[]) {
    const socketLoggingMod = this.suckitService
      .getActiveWebsockets()
      .find(sock => sock.activeModLogKey === modId)

    const modData = this.getLatestModData(modId)
    if (modData?.logger) {
      modData.logger.log(level, args)
    } else {
      console.warn(`${modId} logger not ready, logged: `, ...args)
    }

    // if (socketLoggingMod) {
    //   socketLoggingMod.send({
    //     type: 'log',
    //     data: args,
    //   })
    // }
  }

  getLatestModData(modId: string) {
    return this.latestFoundModsMap[`mod/${modId}`]
  }

  async activate() {
    interceptPacket('message', undefined, async ({ data: { msg } }) => {
      this.popupService.showMessage(msg)
    })
    interceptPacket('notification', undefined, async ({ data: notif }) => {
      this.popupService.showNotification(notif)
    })
    interceptPacket(
      'project',
      undefined,
      async ({ data: { name: projectName, hasActiveEngine, selectedTrack } }) => {
        const projectChanged = this.currProject !== projectName
        if (projectChanged) {
          this.currProject = projectName
          this.events.projectChanged.emit(projectName)
          if (hasActiveEngine) {
            this.activeEngineProject = projectName
            this.events.activeEngineProjectChanged.emit(projectName)
          }
        }
        if (selectedTrack && (!this.currTrack || this.currTrack.name !== selectedTrack.name)) {
          const prev = this.currTrack
          this.currTrack = selectedTrack
          this.events.selectedTrackChanged.emit(this.currTrack, prev)
        }
      }
    )
    interceptPacket('device', undefined, async ({ data: device }) => {
      this.currDevice = device
    })
    interceptPacket('cue-markers', undefined, async ({ data: cueMarkers }) => {
      this.cueMarkers = cueMarkers
      this.events.cueMarkersChanged.emit(this.cueMarkers)
    })

    // API endpoint to set the current log for specific websocket
    interceptPacket('api/mods/log', ({ data: modId }, websocket) => {
      websocket.activeModLogKey = modId
    })
    interceptPacket('bitwig/log', undefined, packet => {
      logger.info(colors.yellow(`Bitwig: ` + packet.data.msg))
      if (packet.data.modId) {
        this.logForMod(packet.data.modId, 'info', packet.data.msg)
      }
    })
    interceptPacket('apiCall', undefined, async packet => {
      this.log('Got api call', packet)
      const {
        data: { path, modId, args },
      } = packet
      let modApi = Object.values(this.activeModApiIds).find(api => {
        return api.Mod.id === modId
      })
      if (!modApi) {
        modApi = await getModApi.call(this, { id: modId })
        this.activeModApiIds[modApi.id] = modApi
      }
      const defrostFunctions = obj => {
        for (const key in obj) {
          this.log(key)
          if (key.indexOf('__function') === 0) {
            const func = eval(
              obj[key].replace(
                /\([^)]*\)/,
                `({ ${[...Object.keys(modApi), ...Object.keys(this.staticApi)].join(', ')} })`
              )
            )
            obj[key.substr('__function'.length)] = () => {
              func(modApi)
            }
            delete obj[key]
          }
        }
        return obj
      }
      const deepValue = function (obj, path) {
        for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
          obj = obj[path[i]]
        }
        return obj
      }

      const funcResolved = deepValue(modApi, path)
      if (typeof funcResolved === 'function') {
        const args2 = args.map(arg => defrostFunctions(arg))
        this.log(funcResolved, args2)
        funcResolved(...args2)
      }
    })
    addAPIMethod('api/mods', async () => {
      return await getModsWithInfo({ latestFoundModsMap: this.latestFoundModsMap })
    })
    addAPIMethod('api/mod/action', async ({ action, id }) => {
      if (action === 'resetToDefault') {
        await this.settingsService.removeAllForMod(id)
        // Settings can only affect local mods, no need to refresh Bitwig ones
        this.refreshMods(true)
        return true
      }
      return false
    })
    addAPIMethod('api/actions/run', async ({ id }) => {
      this.log('Got packet with id ' + id)
      return await this.shortcutsService.runAction(id)
    })
    addAPIMethod('api/mod', async ({ id }) => {
      const mod = (
        await getModsWithInfo({ modId: id, latestFoundModsMap: this.latestFoundModsMap })
      )[0] as any
      const db = await getDb()
      const settings = db.getRepository(Setting)
      const settingsForMod = await settings.find({
        where: {
          mod: mod.id,
        },
      })
      // console.log(settingsForMod)
      mod.actions = settingsForMod
        .filter(setting => {
          const isShortcut = setting.type === 'shortcut'
          const registeredNow = setting.key in this.latestFoundModsMap[`mod/${mod.id}`].actions!
          return isShortcut && registeredNow
        })
        .map(setting => {
          const action = this.shortcutsService.newShortcutRegistry[setting.key]?.action || {}
          return {
            ...this.settingsService.postload(setting),
            ...action,
          }
        })
      mod.settings = settingsForMod
        .filter(setting => setting.type !== 'mod' && setting.type !== 'shortcut')
        .map(setting => {
          const info = this.settingKeyInfo[setting.key]
          return {
            ...this.settingsService.postload(setting),
            ...info,
            notFound: !info,
          }
        })
      return mod
    })

    const refreshFolderWatcher = async () => {
      this.debug('Refreshing folder watcher')
      if (this.folderWatcher) {
        this.folderWatcher.close()
        this.folderWatcher = null
      }
      if (this.isQuitting) {
        this.debug('Quitting, not restarting another folder watcher')
        return
      }
      const folderPaths = await getModsFolderPaths()
      this.debug('Watching ' + folderPaths)

      this.folderWatcher = chokidar
        .watch(folderPaths, {
          ignoreInitial: true,
        })
        .on('all', (event, path) => {
          this.log(event, path)
          this.refreshMods(path.indexOf('bitwig.js') === -1)
        })
      if (process.env.NODE_ENV === 'dev' && !this.controllerScriptFolderWatcher) {
        const mainScript = getResourcePath('/controller-script/bes.control.js')
        this.log('Watching ' + mainScript)
        this.controllerScriptFolderWatcher = chokidar
          .watch([mainScript], {
            ignoreInitial: true,
          })
          .on('all', (event, path) => {
            this.log(event, path)
            this.refreshMods()
          })
      }
    }
    this.settingsService.events.settingUpdated.listen(setting => {
      // this.log(setting)
      const key = setting.key!
      if (key === 'userLibraryPath') {
        refreshFolderWatcher()
        this.refreshBitwigMods(false)
      } else if (key.indexOf('mod') === 0) {
        if (setting.type === 'mod') {
          const modData = this.latestFoundModsMap[key]
          const value = JSON.parse(setting.value)
          const reload = !modData.noReload
          this.popupService.showMessage(
            `${modData.name}: ${value.enabled ? 'Enabled' : 'Disabled'}`
          )

          if (reload) {
            this.refreshMods()
          } else {
            this.log('Mod marked as `noReload`, only reloading local')
            this.refreshMods(true)
            const data = {
              [modData.id!]: value.enabled,
            }
            sendPacketToBitwig({ type: 'settings/update', data })
          }
        } else if (setting.type === 'boolean') {
          const info = this.settingKeyInfo[key]
          if (!info) {
            return this.log(
              `Setting updated (${setting.key}) but no info found, mod no longer exists?`
            )
          }
          const value = JSON.parse(setting.value)
          if (setting.type === 'boolean') {
            this.popupService.showMessage(`${info.name}: ${value.enabled ? 'Enabled' : 'Disabled'}`)
          }
        }
      } else if (setting.type === 'shortcut') {
        const actionId = key
        for (const modKey in this.latestFoundModsMap) {
          const mod = this.latestFoundModsMap[modKey]
          const action = (mod.actions || {})[actionId]
          if (action) {
            this.shortcutsService.addActionToShortcutRegistry(
              action,
              this.settingsService.postload(setting).value
            )
            this.shortcutsService.updateCache()
            return
          }
        }
      }
    })

    this.refreshMods()
    refreshFolderWatcher()

    this.shortcutsService.events.enteringValue.listen(enteringValue => {
      this.popupService.updateCanvas({
        enteringValue,
      })
    })

    this.shortcutsService.events.actionTriggered.listen((async (action, context) => {
      if ((await this.settingsService.getSettingValue('notifications-actions')).enabled) {
        this.popupService.showNotification({
          type: 'actionTriggered',
          data: {
            title: action.title || action.id,
            ...context,
          },
        })
      }
    }) as any)

    this.bitwigService.events.browserOpen.listen(isOpen => {
      this.popupService.updateCanvas({
        browserIsOpen: isOpen,
      })
    })

    app.on('before-quit', event => {
      this.log('Before quit')
      this.isQuitting = true
      refreshFolderWatcher()
      for (const cb of this.onReloadMods) {
        try {
          cb()
        } catch (e) {
          this.error(`Error when reloading mods on quit: `, e)
        }
      }
    })
  }

  async gatherModsFromPaths(paths: string[], { type }: { type: 'bitwig' | 'local' }) {
    let modsById = {}
    // Load mods from all folders, with latter folders having higher precedence (overwriting by id)
    for (const modsFolder of paths) {
      const files = await fs.readdir(modsFolder)
      for (const filePath of files) {
        const actualType = filePath.indexOf('bitwig.js') >= 0 ? 'bitwig' : 'local'
        // console.log(filePath, actualType)
        if (filePath.substr(-3) !== '.js' || actualType !== type) {
          continue
        }
        try {
          const contents = await fs.readFile(path.join(modsFolder, filePath), 'utf8')
          const hasTag = tag => {
            const result = new RegExp(`@${tag}`).exec(contents)
            return !!result
          }
          const checkForTag = tag => {
            const result = new RegExp(`@${tag} (.*)`).exec(contents)
            return result ? result[1] : undefined
          }
          const id = checkForTag('id')
          const name = checkForTag('name') ?? 'No name set'
          const description = checkForTag('description') || ''
          const disabled = hasTag('disabled')
          const category = checkForTag('category') ?? 'global'
          const version = checkForTag('version') ?? '0.0.1'
          const os = checkForTag('os') ?? ''
          const creator = checkForTag('creator')
          const applications = checkForTag('applications')?.split(',') ?? []
          const noReload = contents.indexOf('@noReload') >= 0
          const settingsKey = `mod/${id}`
          const p = path.join(modsFolder, filePath)
          const isDefault = p.indexOf(getResourcePath('/default-mods')) >= 0
          const actualId = id === undefined ? 'temp' + nextId++ : id

          const thisOS =
            {
              darwin: 'macOS',
              win32: 'windows',
            }[require('os').platform()] || 'unknown'

          const osMatches =
            os === '' ||
            os.split(',').some(os => {
              return os.trim().toLowerCase() === thisOS.toLowerCase()
            })
          modsById[actualId] = {
            id: actualId,
            name,
            applications,
            disabled,
            osMatches,
            settingsKey,
            isBuiltIn: true, // FIXME
            description,
            category,
            actionCategories: {},
            actions: {},
            version,
            creator,
            contents,
            noReload,
            path: p,
            isDefault,
            valid: id !== undefined,
          }
        } catch (e) {
          this.log(colors.red(`Error with ${filePath}`, e))
        }
      }
    }
    return modsById
  }

  async initModAndStoreInMap(mod) {
    if (mod.valid) {
      // Don't add settings for invalid (not loaded properly mods)
      await this.settingsService.insertSettingIfNotExist({
        key: mod.settingsKey,
        value: {
          enabled: false,
          keys: [],
        },
        type: 'mod',
      })
    }

    this.latestFoundModsMap[mod.settingsKey] = mod
  }

  async isModEnabled(mod) {
    if (process.env.SAFE_MODE === 'true') {
      return false
    }
    return (await this.settingsService.getSetting(mod.settingsKey))?.value.enabled ?? false
  }

  wrappedOnForReloadDisconnect = parent => {
    return (...args) => {
      const id = parent.on(...args)
      this.onReloadMods.push(() => {
        parent.off(id)
      })
    }
  }

  staticApi = {
    wait: wait,
    clamp: clamp,
    showMessage: this.popupService.showMessage,
  }

  async refreshLocalMods() {
    const modsFolders = await getModsFolderPaths()
    this.activeModApiIds = {}
    this.shortcutsService.pauseCacheUpdate()

    // Remove all existing built files, but not node_modules
    await new Promise(async resolve => {
      const jsFiles = glob.sync(path.join(buildModsPath, '**/*.js'), {
        ignore: ['**/node_modules'],
      })
      for (const file of jsFiles) {
        // Remove file
        this.verbose(`Removing ${file}`)
        await fs.unlink(file)
      }
      resolve(undefined)
    })
    await createDirIfNotExist(buildModsPath)

    try {
      const modsById = await this.gatherModsFromPaths(modsFolders, {
        type: 'local',
      })

      for (const modId in modsById) {
        const mod = modsById[modId]
        const { disabled, osMatches } = mod
        this.initModAndStoreInMap(mod)
        const isEnabled = await this.isModEnabled(mod)
        mod.enabled = isEnabled
        if (!isEnabled && !mod.isBuiltIn) {
          // Don't automatically run externally added mods because we should warn the user first before enabling
          continue
        }
        if ((process.env.SCREENSHOTS !== 'true' && disabled) || !osMatches) {
          mod.enabled = false
          mod.disabled = true
          // Disable dev only mods (@disabled) and mods where the os doesn't match
          continue
        } else {
          // Force it to not disabled when SCREENSHOTS=true
          mod.disabled = false
        }

        const api = await getModApi.call(this, mod)
        this.activeModApiIds[api.id] = api

        // Populate function scope with api objects
        const fileStr = `
module.exports = async function ({ ${[...Object.keys(api), ...Object.keys(this.staticApi)].join(
          ', '
        )} }) {
${mod.contents}
}
`
        // Make folder for mod
        const modFolder = path.join(buildModsPath, mod.id)
        await createDirIfNotExist(modFolder)
        const p = path.join(modFolder, `${mod.id}${nextId++}.js`)
        await writeStrFile(fileStr, p)

        // Create a logger in the subdirectory for this mod only
        mod.logger = winston.createLogger({
          defaultMeta: { mod: mod.id },
          // format: lockpickLogFormatter,
          transports: [
            lockpickFileLogger({
              filename: path.join(modFolder, 'log.log'),
              level: 'debug',
            }),
            new winston.transports.Console({
              level: 'warn',
            }),
          ],
        })

        const requireRegex = /require\('([^']+)'\)/g
        const nodeModules = Array.from(fileStr.matchAll(requireRegex))
          .map(m => m[1])
          .filter(module => !isBuiltInModule(module))

        if (nodeModules.length > 0) {
          // Try install npm modules in same folder withExec
          this.debug(`Installing ${nodeModules.join(', ')} for ${mod.id}`)
          const result = spawn(
            'yarn',
            ['add', ...nodeModules, '--non-interactive', '--no-progress'],
            {
              cwd: modFolder,
              stdio: 'inherit',
            }
          )
          // wait for result to finish
          await new Promise((resolve, rej) => {
            result.on('error', rej)
            result.on('close', resolve)
          })
        }

        this.logForMod(mod.id, 'debug', `About to load ${mod.name} from ${p}`)
        try {
          const fn = require(p)
          const allApi = { ...api, ...this.staticApi }
          await fn(allApi)
        } catch (e) {
          this.error(`Error loading mod ${mod.id}`)
          mod.error = {
            message: e.message,
            stack: e.stack,
          }
          this.popupService.showMessage(`Error loading ${mod.id}, check preferences for details`)
          logger.error(e)
        }
      }
    } catch (e) {
      this.error(`Error loading mods`)
      console.error(e)
    }

    this.shortcutsService.unpauseCacheUpdate()
  }

  async refreshBitwigMods(noWriteFile: boolean) {
    const modsFolders = await getModsFolderPaths()
    let controllerScript = `
// Auto generated by ${APP_NAME}
function loadMods(api) {

function modsImpl(api) {
`
    const modsById = await this.gatherModsFromPaths(modsFolders, {
      type: 'bitwig',
    })
    const defaultControllerScriptSettings = {}

    for (const modId in modsById) {
      const mod = modsById[modId]
      if (!this.getLatestModData(mod.id)) {
        this.initModAndStoreInMap(mod)
      }
      const isEnabled = await this.isModEnabled(mod)
      if (isEnabled || mod.noReload) {
        this.log('Enabled Bitwig Mod: ' + colors.green(modId))
        defaultControllerScriptSettings[modId] = isEnabled
        controllerScript += `
// ${mod.path}
//
//
//
//
;(() => {
const thisModApi = api(${JSON.stringify({ id: modId })})
for (var key in thisModApi) {
    var toRun = 'var ' + key + ' = thisModApi["' + key + '"]'
    // println(toRun)
    eval(toRun)
}
${mod.contents.replace(/Mod\.enabled/g, `settings['${modId}']`)}
})()
`
      }
    }
    controllerScript += `}
${Object.keys(defaultControllerScriptSettings)
  .map(key => {
    return `settings['${key}'] = ${defaultControllerScriptSettings[key]}`
  })
  .join('\n')}
modsImpl(api)
\n}`
    const controllerScriptMods = path.join(buildModsPath, 'mods.js')
    if (!noWriteFile) {
      await fs.writeFile(controllerScriptMods, controllerScript)
      await copyControllerScript({ settingsService: this.settingsService })
    }
  }

  waitingOnAnotherReload = false
  async refreshMods(localOnly = false) {
    if (modsLoading) {
      this.waitingOnAnotherReload = true
      return
    }

    this.log('Refreshing mods')
    modsLoading = true

    // Handlers to disconnect any dangling callbacks etc
    for (const func of this.onReloadMods) {
      try {
        func()
      } catch (e) {
        logger.error('Error when running onReloadMod', e)
      }
    }

    this.onReloadMods = []
    this.latestFoundModsMap = {}

    await this.refreshLocalMods()
    await this.refreshBitwigMods(localOnly)

    this.refreshCount++
    modsLoading = false

    sendPacketToBrowser({
      type: 'event/mods-reloaded',
    })
    this.events.modsReloaded.emit()

    if (this.waitingOnAnotherReload) {
      this.waitingOnAnotherReload = false
      this.refreshMods(false)
    }

    if ((await this.settingsService.getSettingValue('notifications-reloading')).enabled) {
      if (this.refreshCount === 0) {
        this.popupService.showMessage(`${Object.keys(this.latestFoundModsMap).length} Mods loaded`)
      } else {
        this.popupService.showMessage(
          `Reloaded ${localOnly ? 'local' : 'all'} mods (${
            Object.keys(this.latestFoundModsMap).length
          } loaded)`
        )
      }
    }
  }
}
