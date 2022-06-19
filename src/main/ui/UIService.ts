import { Geometry } from '@mtyk/types'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { debounce } from 'lodash'
import { wait } from '../../connector/shared/engine/Debounce'
import { returnMouseAfter } from '../../connector/shared/EventUtils'
import { BitwigService } from '../bitwig/BitwigService'
import { BESService, EventRouter, makeEvent } from '../core/Service'
import { interceptPacket } from '../core/WebsocketToSocket'
import { SettingsService } from '../settings/SettingsService'
import { ShortcutsService } from '../shortcuts/ShortcutsService'
import { app } from 'electron'
const { Keyboard, Bitwig, UI, Mouse: NativeMouse, MainWindow } = require('bindings')('bes')

/**
 * UI Service is basically responsible for keeping an up to date (insofar as possbile) representation of the Bitwig UI.
 * e.g. currently active tool, whether they are entering a value. Some of this stuff still remains in the mod service but we will
 * gradually move things over to here when it makes sense.
 */
@Injectable()
export class UIService extends BESService {
  constructor(
    protected settingsService: SettingsService,
    protected shortcutsService: ShortcutsService,
    @Inject(forwardRef(() => BitwigService)) protected bitwigService: BitwigService
  ) {
    super('UIService')
  }

  // Internal state
  activeTool = 0
  previousTool = 0
  activeToolKeyDownAt = new Date()
  uiMainWindow = new UI.BitwigWindow({})
  uiScale = 1
  uiLayout = 'Single Display (Large)'
  apiEventRouter = new EventRouter<any>()
  idsByEventType: { [type: string]: number } = {}
  modalWasOpen = false
  Mouse: any
  isQuitting = false

  // Events
  events = {
    toolChanged: makeEvent<number>(),
  }

  addExtras() {
    const uiService = this
    this.Mouse = {
      click: async (...args: any[]) => {
        const button = args[0]
        const opts = args[args.length - 1] || {}
        const doIt = async () => {
          const reallyDoIt = async () => {
            let ret
            if (typeof button !== 'number') {
              ret = NativeMouse.click(0, ...args)
            } else {
              ret = NativeMouse.click(...args)
            }
            if (typeof opts.returnAfter === 'number') {
              await wait(opts.returnAfter)
            }
            return ret
          }
          if (opts.returnAfter) {
            return returnMouseAfter(reallyDoIt)
          } else {
            return reallyDoIt()
          }
        }
        if (opts.avoidPluginWindows) {
          return this.Mouse.avoidingPluginWindows(opts, doIt)
        } else {
          return doIt()
        }
      },
      on: (event: string, cb: (data: any) => void) => {
        const id = this.apiEventRouter.on(event, cb)
        if (!this.idsByEventType[event]) {
          const id = Keyboard.on(event, (...args: any) => {
            this.apiEventRouter.emit(event, ...args)
          })
          // this.log(`Id for ${event} is ${id}`)
          this.idsByEventType[event] = id
        }
        return () => {
          this.Mouse.off(event, id)
        }
      },
      off: (event: string, id: number) => {
        this.apiEventRouter.off(event, id)
      },
      avoidingPluginWindows: async (pointOpts: { noReposition: any }, cb: () => any) => {
        if (!this.eventIntersectsPluginWindows(pointOpts)) {
          return Promise.resolve(cb())
        }
        const pluginPositions = Bitwig.getPluginWindowsPosition()
        const displayDimensions = MainWindow.getMainScreen()
        let tempPositions = {}
        for (const key in pluginPositions) {
          tempPositions[key] = {
            ...pluginPositions[key],
            x: displayDimensions.w - 1,
            y: displayDimensions.h - 1,
          }
        }
        Bitwig.setPluginWindowsPosition(tempPositions)
        return new Promise<void>(res => {
          setTimeout(async () => {
            const result = cb()
            if (result && result.then) {
              await result
            }
            if (!pointOpts.noReposition) {
              Bitwig.setPluginWindowsPosition(pluginPositions)
            }
            res()
          }, 100)
        })
      },
    }

    const proto = this.uiMainWindow
    const ArrangerTrack = {
      async selectWithMouse() {
        const opts = {
          x: this.rect.x + this.rect.w - uiService.scale(7),
          y: this.visibleRect.y + uiService.scale(7),
          avoidPluginWindows: true,
          returnAfter: true,
        }
        uiService.log(opts)
        return uiService.Mouse.click(opts)
      },
      async toggleExpandedWithMouse() {
        const folderIconWidth = uiService.scale(18)
        // Click a few from the left hand side in increments of the folder icon width
        // so we only hit it once. Quicker than working out where it is
        const startPos = NativeMouse.getPosition()
        const opts = {
          y: this.visibleRect.y + uiService.scale(this.isLargeTrackHeight ? 32 : 14),
          avoidPluginWindows: true,
        }
        for (let i = 0; i < 5; i++) {
          const x = this.visibleRect.x + uiService.scale(10) + i * folderIconWidth
          uiService.Mouse.click({
            ...opts,
            x,
          })
        }
        NativeMouse.setPosition(startPos.x, startPos.y)
      },
    }
    proto.getArrangerTracks = (...args: any) => {
      const results = proto._getArrangerTracks(...args)
      return results ? results.map((obj: any) => Object.setPrototypeOf(obj, ArrangerTrack)) : null
    }
  }

  getApi({ mod, makeEmitterEvents, onReloadMods }) {
    const that = this

    const MouseEvent = {
      intersectsPluginWindows() {
        return that.eventIntersectsPluginWindows(this)
      },
      noModifiers() {
        return !(this.Meta || this.Control || this.Alt || this.Shift)
      },
    }

    const api = {
      Mouse: {
        ...NativeMouse,
        ...this.Mouse,
        _on: (event: any, cb: any) => {
          if (!mod.enabled) {
            return () => {}
          }
          const removeListener = this.Mouse.on(event, cb)
          onReloadMods(() => {
            this.debug('Should be removing listener')
            removeListener()
          })
          return removeListener
        },
        on: (eventName: string, cb: Function) => {
          if (!mod.enabled) {
            return
          }
          const wrappedCb = async (event: any, ...rest: any[]) => {
            // this.eventLogger({msg: eventName, modId: mod.id})
            Object.setPrototypeOf(event, MouseEvent)
            cb(event, ...rest)
          }
          if (eventName === 'click') {
            let downEvent: string, downTime: Date
            api.Mouse._on('mousedown', (event: any) => {
              downTime = new Date()
              downEvent = JSON.stringify(event)
            })
            api.Mouse._on('mouseup', (event: any, ...rest: any) => {
              if (
                JSON.stringify(event) === downEvent &&
                downTime &&
                new Date().getTime() - downTime.getTime() < 250
              ) {
                wrappedCb(event, ...rest)
              }
            })
          } else if (eventName === 'doubleClick') {
            let lastClickTime = new Date(0)
            api.Mouse._on('click', (event: any, ...rest: any) => {
              if (new Date().getTime() - lastClickTime.getTime() < 250) {
                wrappedCb(event, ...rest)
                lastClickTime = new Date(0)
              } else {
                lastClickTime = new Date()
              }
            })
          } else {
            api.Mouse._on(eventName, wrappedCb)
          }
        },
        lockX: Keyboard.lockX,
        lockY: Keyboard.lockY,
        returnAfter: returnMouseAfter,
      },
      UI: {
        ...UI,
        MainWindow: this.uiMainWindow,
        get activeTool() {
          return that.activeTool
        },
        get layout() {
          return that.uiLayout
        },
        ...makeEmitterEvents({
          activeToolChanged: this.events.toolChanged,
        }),
        screenshotsEnabled: process.env.SCREENSHOTS === 'true',
        scaleXY: (args: Geometry.Point) => this.scaleXY(args),
        scale: (point: any) => this.scaleXY({ x: point, y: 0 }).x,
        unScaleXY: (args: Geometry.Point) => this.unScaleXY(args),
        unScale: (point: any) => this.unScaleXY({ x: point, y: 0 }).x,
        bwToScreen: (args: Geometry.Point) => this.bwToScreen(args),
        screenToBw: (args: Geometry.Point) => this.screenToBw(args),
        get doubleClickInterval() {
          return 250
        },
      },
    }
    return api
  }

  checkIfModalOpen = debounce(() => {
    UI.invalidateLayout()
    this.uiMainWindow.updateFrame()

    if (process.env.SCREENSHOTS !== 'true') {
      return
    }

    const layout = this.uiMainWindow.getLayoutState()

    // FIXME because of lack of explicit ordering of event listeners between services,
    // the ShortcutsService will receive one round of inputs that correspond to an invalid UI
    // state if the modal is triggered by keyboard shortcuts.
    if (layout.modalOpen && !this.modalWasOpen) {
      this.log('Modal is open, pausing shortcuts')
      this.shortcutsService.pause()
      this.modalWasOpen = true
    } else if (!layout.modalOpen && this.modalWasOpen) {
      this.log('Modal closed, unpausing shortcuts')
      this.shortcutsService.unpause()
      this.modalWasOpen = false
    }
  }, 250)

  async onModuleInit() {
    app.on('before-quit', event => {
      this.log('Before quit')
      if (!this.isQuitting) {
        this.isQuitting = true
        Keyboard.beforeQuit()
      }
    })

    // Track tool changes via number keys
    Keyboard.on(
      'keydown',
      (event: { lowerKey: string; Meta: any; Shift: any; Control: any; Alt: any }) => {
        if (!Bitwig.isActiveApplication()) {
          return
        }
        const asNumber = parseInt(event.lowerKey, 10)
        if (
          asNumber !== this.activeTool &&
          !(event.Meta || event.Shift || event.Control || event.Alt) &&
          asNumber > 0 &&
          asNumber < 6
        ) {
          this.previousTool = this.activeTool
          this.activeTool = asNumber
          this.activeToolKeyDownAt = new Date()
          this.events.toolChanged.emit(this.activeTool)
        }
      }
    )

    Keyboard.on('keyup', (event: { lowerKey: string }) => {
      if (!Bitwig.isActiveApplication()) {
        return
      }

      const asNumber = parseInt(event.lowerKey, 10)
      if (
        asNumber === this.activeTool &&
        new Date().getTime() - this.activeToolKeyDownAt.getTime() > 250
      ) {
        this.activeTool = this.previousTool
        this.activeToolKeyDownAt = new Date(0)
        this.events.toolChanged.emit(this.activeTool)
      }

      this.checkIfModalOpen()
    })

    this.settingsService.onSettingValueChange('uiScale', val => {
      this.uiScale = parseInt(val, 10) / 100
      UI.updateUILayoutInfo({ scale: parseInt(val, 10) / 100 })
      this.debug(`Ui scale set to ${this.uiScale}`)
    })

    this.settingsService.onSettingValueChange('uiLayout', val => {
      this.uiLayout = val
      UI.updateUILayoutInfo({ layout: val })
      this.debug(`Ui layout set to ${this.uiLayout}`)
    })

    interceptPacket('ui', undefined, packet => {
      this.debug('Updating UI from packet: ', packet)
      UI.updateUILayoutInfo(packet.data)
    })

    this.addExtras()
    this.Mouse.on('mousedown', (event: { button: number }) => {
      if (event.button === 0) {
        this.apiEventRouter.muteEvent('mousedown')
      }
    })
    this.Mouse.on(
      'mouseup',
      (event: { button: number; y: number; Meta: any; Shift: any; Alt: any; Control: any }) => {
        if (event.button === 0) {
          this.apiEventRouter.unmuteEvent('mousedown')
        }

        // Attempt to track when user is entering a text field
        // FIXME for scaling
        if (
          Bitwig.isActiveApplication() &&
          event.y > 1000 &&
          event.Meta &&
          !event.Shift &&
          !event.Alt &&
          !event.Control &&
          !this.eventIntersectsPluginWindows(event) &&
          !this.bitwigService.browserIsOpen
        ) {
          // Assume they are clicking to enter a value by keyboard
          this.shortcutsService.setEnteringValue(true)
        }

        this.checkIfModalOpen()
      }
    )
  }

  eventIntersectsPluginWindows(event: any) {
    if ('_intersectsPluginWindows' in event) {
      return event._intersectsPluginWindows
    }
    const pluginLocations = Bitwig.getPluginWindowsPosition()
    for (const key in pluginLocations) {
      const { x, y, w, h, ...rest } = pluginLocations[key]
      if (event.x >= x && event.x < x + w && event.y >= y && event.y < y + h) {
        let out = {
          id: key,
          x,
          y,
          w,
          h,
          ...rest,
        }
        event._intersectsPluginWindows = out
        return out
      }
    }
    event._intersectsPluginWindows = false
    return false
  }

  bwToScreen({ x, y, ...rest }: Geometry.Point) {
    const frame = this.uiMainWindow.getFrame()
    const scaled = this.scaleXY({ x, y })
    return {
      x: scaled.x + frame.x,
      y: scaled.y + frame.y,
      ...rest,
    }
  }

  screenToBw({ x, y, ...rest }: Geometry.Point) {
    const frame = this.uiMainWindow.getFrame()
    const bwRelative = {
      x: x - frame.x,
      y: y - frame.y,
      ...rest,
    }
    return this.unScaleXY(bwRelative)
  }

  scaleXY({ x, y, ...rest }: Geometry.Point) {
    return {
      x: x * this.uiScale,
      y: y * this.uiScale,
      ...rest,
    }
  }

  scale = (point: number) => this.scaleXY({ x: point, y: 0 }).x
  unscale = (point: number) => this.unScaleXY({ x: point, y: 0 }).x

  unScaleXY({ x, y, ...rest }: Geometry.Point) {
    return {
      x: x / this.uiScale,
      y: y / this.uiScale,
      ...rest,
    }
  }
}
