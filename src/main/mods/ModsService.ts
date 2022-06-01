import { promises as fs } from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import { APP_NAME } from '../../connector/shared/Constants'
import { wait } from '../../connector/shared/engine/Debounce'
import { clamp } from '../../connector/shared/Math'
import { getResourcePath } from '../../connector/shared/ResourcePath'
import { BitwigService } from '../bitwig/BitwigService'
import { buildModsPath } from '../config'
import { createDirIfNotExist } from '../core/Files'
import { logger } from '../core/Log'
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
import gatherModsFromPaths from './helpers/gatherModsFromPaths'
import getModApi from './helpers/getModApi'
import getModsFolderPaths from './helpers/getModsFolderPaths'
import getModsWithInfo from './helpers/getModsWithInfo'
import isModEnabled from './helpers/isModEnabled'
import loadMod from './helpers/loadMod'
import logForMod from './helpers/logForMod'
import { ModInfo, SettingInfo } from './types'
const chokidar = require('chokidar')
const colors = require('colors')
const { app } = require('electron')

let nextId = 0
let modsLoading = false

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
    modsReloaded: makeEvent<void>(),
  }

  lastLogMsg = ''
  sameMessageCount = 0
  waitingMessagesByModId: {
    [modId: string]: { msg: string; count: number }[]
  } = {}

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

    // API endpoint to set the current log for specific websocket
    interceptPacket('api/mods/log', ({ data: modId }, websocket) => {
      websocket.activeModLogKey = modId
    })
    interceptPacket('bitwig/log', undefined, packet => {
      logger.info(colors.yellow(`Bitwig: ` + packet.data.msg))
      if (packet.data.modId) {
        logForMod(packet.data.modId, 'info', packet.data.msg)
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
      const modsById = await gatherModsFromPaths(modsFolders, {
        type: 'local',
      })
      for (const modId in modsById) {
        const mod = modsById[modId]
        await loadMod.call(this, mod)
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
    const modsById = await gatherModsFromPaths(modsFolders, {
      type: 'bitwig',
    })
    const defaultControllerScriptSettings = {}

    for (const modId in modsById) {
      const mod = modsById[modId]
      if (!this.getLatestModData(mod.id)) {
        this.initModAndStoreInMap(mod)
      }
      const isEnabled = await isModEnabled(mod)
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
