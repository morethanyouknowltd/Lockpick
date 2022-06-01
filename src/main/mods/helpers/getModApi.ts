import { clipboard } from 'electron'
import * as _ from 'lodash'
import { APP_VERSION } from '../../../connector/shared/Constants'
import { debounce } from '../../../connector/shared/engine/Debounce'
import { whenActiveListener } from '../../../connector/shared/EventUtils'
import { containsPoint, containsX, containsY } from '../../../connector/shared/Rect'
import { BitwigService } from '../../bitwig/BitwigService'
import isLockpickActiveApplication from '../../core/helpers/isLockpickActiveApplication'
import { logger as mainLogger } from '../../core/Log'
import { getService } from '../../core/Service'
import { SettingsService } from '../../core/SettingsService'
import { interceptPacket, SocketMiddlemanService } from '../../core/WebsocketToSocket'
import { getDb } from '../../db'
import { Project } from '../../db/entities/Project'
import { ProjectTrack } from '../../db/entities/ProjectTrack'
import { PopupService } from '../../popup/PopupService'
import { ActionSpec, ShortcutsService } from '../../shortcuts/ShortcutsService'
import { UIService } from '../../ui/UIService'
import type { ModsService } from '../ModsService'
import { KeyboardEvent } from './KeyboardEvent'
import { createOrUpdateTrack, getProjectIdForName, loadDataForTrack } from './loadData'
import logForMod from './logForMod'
import makeEmitterEventsFn from './makeEmitterEventsFn'
const colors = require('colors')
const { Keyboard, MainWindow, Bitwig } = require('bindings')('bes')

let nextId = 0
const logger = mainLogger.child('modApi')

export default async function getModApi(this: ModsService, mod) {
  const db = await getDb()
  const projectTracks = db.getRepository(ProjectTrack)
  const projects = db.getRepository(Project)
  const uiService = getService(UIService)
  const popupService = getService(PopupService)
  const shortcutsService = getService(ShortcutsService)
  const socketService = getService(SocketMiddlemanService)
  const bitwigService = getService(BitwigService)
  const settingsService = getService(SettingsService)
  const modsService = this
  const thisApiId = nextId++
  const wrappedOnForReloadDisconnect = parent => {
    return (...args) => {
      const id = parent.on(...args)
      modsService.onReloadMods.push(() => {
        parent.off(id)
      })
    }
  }

  const makeEmitterEvents = map =>
    makeEmitterEventsFn({ mod, onReloadMods: modsService.onReloadMods }, map)
  const uiApi = uiService.getApi({
    mod,
    makeEmitterEvents,
    onReloadMods: cb => modsService.onReloadMods.push(cb),
  })
  const popupApi = popupService.getApi({
    mod,
    makeEmitterEvents,
    onReloadMods: cb => modsService.onReloadMods.push(cb),
  })
  const wrapCbForApplication = cb => {
    return (...args) => {
      if ((mod.applications?.length ?? 0) > 0) {
        // Don't run cb if specified application not active
        const apps = mod.applications
        const oneActive = apps.find(a => Bitwig.isActiveApplication(a))
        if (!oneActive) {
          return
        }
      } else if (!isLockpickActiveApplication()) {
        // @applications was empty, assume meant for Bitwig only
        return
      }
      return cb(...args)
    }
  }

  const apiGenArgs = {
    makeEmitterEvents,
    modsService,
  }
  const api = {
    _,
    Popup: popupApi.Popup,
    id: thisApiId,
    log: (...args) => {
      logForMod(mod.id, 'info', ...args)
    },
    error: (...args) => {
      logger.info(`${colors.red(mod.id)}:`, ...args)
      logForMod(mod.id, 'error', ...args)
    },
    Keyboard: {
      ...Keyboard,
      on: (eventName: string, cb: Function) => {
        if (!mod.enabled) {
          return
        }
        const wrappedCb = (event, ...rest) => {
          const eventCopy = { ...event }
          // logForMod(mod.id, 'info', `${eventName}`)
          Object.setPrototypeOf(eventCopy, KeyboardEvent)
          return cb(eventCopy, ...rest)
        }
        wrappedOnForReloadDisconnect(Keyboard)(eventName, wrapCbForApplication(wrappedCb))
      },
      type: (str, opts?) => {
        if (!mod.enabled) {
          return
        }
        String(str)
          .split('')
          .forEach(char => {
            Keyboard.keyPress(char === ' ' ? 'Space' : char, opts)
          })
      },
    },
    Shortcuts: shortcutsService.getApi(),
    whenActiveListener: whenActiveListener,
    Rect: {
      containsPoint,
      containsX,
      containsY,
    },
    Mouse: {
      ...uiApi.Mouse,
      on: (eventName: string, cb) => {
        if (!mod.enabled) {
          return
        }
        return uiApi.Mouse.on(eventName, wrapCbForApplication(cb))
      },
    },
    UI: uiApi.UI,
    Bitwig: bitwigService.getApi(apiGenArgs),
    MainDisplay: {
      getDimensions() {
        return MainWindow.getMainScreen()
      },
    },
    Db: {
      getData: async () => {
        const modSetting = await settingsService.settingExists(`mod/${mod.id}`)
        if (!modSetting) {
          return {}
        }
        return (await settingsService.getSettingValue(`mod/${mod.id}`)).data || {}
      },
      setData: async data => {
        const existingSetting = (await settingsService.getSettingValueOrNull(`mod/${mod.id}`)) || {}
        await settingsService.upsertSetting({
          key: `mod/${mod.id}`,
          type: 'boolean',
          value: {
            enabled: false,
            keys: [],
            ...existingSetting,
            data,
          },
        })
      },
      getTrackData: async (name: string, options: { modId?: string } = {}) => {
        if (!bitwigService.simplifiedProjectName) {
          logForMod(mod.id, 'warn', colors.yellow('Tried to get track data but no project loaded'))
          return null
        }
        return (
          (await loadDataForTrack(name, bitwigService.simplifiedProjectName))[
            options?.modId ?? mod.id
          ] || {}
        )
      },
      setCurrentProjectData: async data => {
        if (!bitwigService.simplifiedProjectName) {
          logForMod(mod.id, colors.yellow('Tried to set project data but no project loaded'))
          return null
        }
        const projectName = bitwigService.simplifiedProjectName
        const projectId = await getProjectIdForName(projectName, true)
        const project = await projects.findOne(projectId)
        logForMod(mod.id, 'info', `Setting project data: `, data)
        await projects.update(projectId, {
          data: {
            ...project.data,
            [mod.id]: data,
          },
        })
      },
      getCurrentProjectData: async () => {
        if (!bitwigService.simplifiedProjectName) {
          logForMod(
            mod.id,
            'warn',
            colors.yellow('Tried to get project data but no project loaded')
          )
          return null
        }
        const project = bitwigService.simplifiedProjectName
        const existingProject = await projects.findOne({
          where: { name: project },
        })
        return existingProject?.data[mod.id] ?? {}
      },
      setTrackData: (name: string, data) => {
        if (!bitwigService.simplifiedProjectName) {
          logForMod(mod.id, 'warn', colors.yellow('Tried to set track data but no project loaded'))
          return null
        }
        return createOrUpdateTrack(name, bitwigService.simplifiedProjectName, {
          [mod.id]: data,
        })
      },
      setExistingTracksData: async (data, exclude: string[] = []) => {
        if (!bitwigService.simplifiedProjectName) {
          logForMod(mod.id, 'warn', colors.yellow('Tried to set track data but no project loaded'))
          return null
        }
        const project = bitwigService.simplifiedProjectName
        const existingProject = await projects.findOne({
          where: { name: project },
        })
        if (!existingProject) {
          return
        }

        const tracksInProject = await projectTracks.find({
          where: { project_id: existingProject.id },
        })
        for (const track of tracksInProject) {
          if (exclude.indexOf(track.name) === -1) {
            await api.Db.setTrackData(track.name, data)
          }
        }
      },
      getCurrentTrackData: () => {
        return api.Db.getTrackData(api.Bitwig.currentTrack)
      },
      setCurrentTrackData: data => {
        return api.Db.setTrackData(api.Bitwig.currentTrack, data)
      },
    },
    Mod: {
      hostVersion: APP_VERSION,
      id: mod.id,
      /**
       * Prevents shortcuts from being triggered if true
       * @param isEnteringValue whether Lockpick should assume you are currently typing in a value for example
       */
      setEnteringValue: (isEnteringValue: boolean) => {
        if (!mod.enabled) {
          return
        }
        shortcutsService.enteringValue = isEnteringValue
      },
      /**
       * Run another Lockpick action by its internal action id
       */
      runAction: (actionId: string, ...args: any[]) => {
        if (!mod.enabled) {
          return
        }
        return shortcutsService.runAction(actionId, ...args)
      },
      /**
       * Run multiple Lockpick actions by their internal action ids
       */
      runActions: (...actionIds: string[]) => {
        if (!mod.enabled) {
          return
        }
        for (const action of actionIds) {
          api.Mod.runAction(action)
        }
      },
      registerActionCategory: categoryDetails => {
        const { title } = categoryDetails
        mod.actionCategories = mod.actionCategories || {}
        mod.actionCategories[title] = categoryDetails
        return title // use title as id-like
      },
      /**
       * Must be called with await to ensure non async value is ready to go
       */
      registerSetting: async settingSpec => {
        const defaultValue = JSON.stringify(settingSpec.value ?? {})
        const actualKey = `mod/${mod.id}/${settingSpec.id}`
        const type = settingSpec.type ?? 'boolean'

        const setting = {
          name: settingSpec.name,
          type,
          category: 'global',
          value: defaultValue,
          key: actualKey,
          mod: mod.id,
        }

        logForMod(mod.id, 'info', colors.blue(setting.name), ':', colors.blue(setting.value))
        settingsService.insertSettingIfNotExist(setting)
        modsService.settingKeyInfo[actualKey] = {
          name: settingSpec.name,
          description: settingSpec.description,
          hidden: !!settingSpec.hidden,
        }

        const settingApi = {
          value: false,
          getValue: async () => {
            if (!(await settingsService.settingExists(actualKey))) {
              settingApi.value = false
              return false
            }
            const val = (await settingsService.getSettingValue(actualKey)).enabled
            settingApi.value = val
            return val
          },
          setValue: async value => {
            if (!mod.enabled) {
              return
            }
            settingsService.setSettingValue(actualKey, {
              enabled: value,
            })
            settingApi.value = value
          },
          toggleValue: async () => {
            if (!mod.enabled) {
              return
            }
            settingApi.value = !settingApi.value
            settingApi.setValue(!(await settingApi.getValue()))
          },
        }

        const listenId = settingsService.events.settingUpdated.listen(setting => {
          if (setting.key === actualKey) {
            settingApi.value = settingsService.postload(setting).value.enabled
          }
        })
        modsService.onReloadMods.push(() => {
          settingsService.events.settingUpdated.stopListening(listenId)
        })

        // Non async access, updated whenever we set
        settingApi.value = await settingApi.getValue()
        return settingApi
      },
      registerAction: async (action: ActionSpec) => {
        if (action.id.indexOf('mod/') === 0) {
          throw new Error(`"mod/" is a reserved prefix`)
        }
        mod.actions = mod.actions || {}
        mod.actions[action.id] = action
        action.category = action.category ? mod.actionCategories[action.category] : null
        // Some of the functions below are async, and we'd rather not restrict mod
        // authors to have to await registerAction() each time. So, we keep track of
        // how many are waiting to fulfil and then update the shortcut cache when
        // we know everything is done.
        shortcutsService.pauseCacheUpdate()

        const existingSetting = await settingsService.getSetting(action.id)
        if (existingSetting && existingSetting.mod !== mod.id) {
          modsService.error(
            colors.red(`Action with id ${action.id} already exists for mod ${mod.id}. Overwriting`)
          )
          await settingsService.deleteSetting(action.id)
        }

        await settingsService.insertSettingIfNotExist({
          key: action.id,
          mod: mod.id,
          value: {
            keys: [],
          },
          type: 'shortcut',
        })
        logForMod(mod.id, 'info', colors.green(`Registered action: ${action.id}`))

        try {
          const settingValue = await settingsService.getSettingValue(action.id)
          if (mod.enabled) {
            const wrappedAction = async (...args) => {
              try {
                await (async () => action.action(...args))()
              } catch (e) {
                logForMod(mod.id, 'error', colors.red(e))
              }
            }
            shortcutsService.addActionToShortcutRegistry(
              {
                ...action,
                action: wrappedAction,
              },
              settingValue
            )
            modsService.onReloadMods.push(() => {
              shortcutsService.removeActionFromShortcutRegistry(action.id)
            })
          } else {
            modsService.log(`Skipping action register ${action.id}, mod ${mod.id} not enabled`)
          }
        } catch (e) {
          modsService.error(e)
        }
        shortcutsService.unpauseCacheUpdate()
      },
      registerActionsWithRange: (
        name: string,
        start: number,
        end: number,
        cb: (i: number) => ActionSpec
      ) => {
        for (let i = start; i <= end; i++) {
          const action = cb(i)
          action.id = name + i
          api.Mod.registerAction(action)
        }
      },
      _registerShortcut: (keys: string[], runner: Function) => {
        const actionId = mod.id + '/' + keys.join('+')
        shortcutsService.addActionToShortcutRegistry(
          {
            id: actionId,
            mod: mod.id,
            action: async (...args) => {
              if (!mod.enabled) {
                return modsService.log('Not running, mod disabled')
              }
              try {
                await (async () => runner(...args))()
              } catch (e) {
                logForMod(mod.id, 'error', colors.red(e))
              }
            },
            title: `${mod.title} Shortcut`,
          },
          {
            keys,
            special: 'null',
          }
        )
        modsService.onReloadMods.push(() => {
          shortcutsService.removeActionFromShortcutRegistry(actionId)
        })
      },
      registerShortcutMap: shortcutMap => {
        for (const keys in shortcutMap) {
          api.Mod._registerShortcut(keys.split(' '), shortcutMap[keys])
        }
      },
      setInterval: (fn, ms) => {
        if (!mod.enabled) {
          return 0
        }
        const id = setInterval(fn, ms)
        modsService.log('Added interval id: ' + id)
        modsService.onReloadMods.push(() => {
          clearInterval(id)
          modsService.log('Clearing interval id: ' + id)
        })
        return id
      },
      get isActive() {
        return thisApiId in modsService.activeModApiIds
      },
      onExit: cb => {
        if (!mod.enabled) {
          return
        }
        modsService.onReloadMods.push(cb)
      },
      getClipboard() {
        return clipboard.readText()
      },
      interceptPacket: (type: string, ...rest) => {
        if (!mod.enabled) {
          return
        }
        const remove = interceptPacket(type, ...rest)
        modsService.onReloadMods.push(remove)
      },
      ...makeEmitterEvents({
        actionTriggered: shortcutsService.events.actionTriggered,
      }),
    },
    debounce,
    throttle: (_ as any).throttle,
    showNotification: notif => {
      if (!mod.enabled) {
        return
      }
      popupService.showNotification(notif)
    },
  }
  const wrapFunctionsWithTryCatch = <T>(value: T, key?: string): T => {
    if (typeof value === 'object') {
      for (const k in value) {
        const desc = Object.getOwnPropertyDescriptor(value, k)
        if ((!desc || !desc.get) && typeof value[k] === 'function') {
          value[k] = wrapFunctionsWithTryCatch(value[k], k)
        } else if ((!desc || !desc.get) && typeof value[k] === 'object') {
          value[k] = wrapFunctionsWithTryCatch(value[k], k)
        }
      }
    } else if (typeof value === 'function') {
      const fn: any = (...args) => {
        const called = value.name || key || 'Unknown function'
        try {
          // if (value !== api.log) {
          //     logForMod(mod.id, 'info', `Called ${called}`)
          // }
          return value(...args)
        } catch (e) {
          logger.error(
            colors.red(`${mod.id} threw an error while calling "${colors.yellow(called)}":`)
          )
          logger.error('Fn:', value.toString())
          logger.error(colors.red(`arguments were: `), ...args)
          logger.error('Raw error:')
          logger.error(e)
          logger.error('Raw error stack:')
          logger.error(e.stack)
          throw e
        }
      }
      return fn
    }
    return value
  }
  return {
    ...wrapFunctionsWithTryCatch(api),
    _,
  }
}