import { interceptPacket } from "../core/WebsocketToSocket"
import { BESService, getService, makeEvent } from "../core/Service"
import { SettingsService } from "../core/SettingsService"
import { PopupService } from "../popup/PopupService"
import { UIService } from "../ui/UIService"
import { isPreferencesActive } from "../core/Os"
const colors = require('colors')
const { Keyboard, Bitwig } = require('bindings')('bes')

let lastKeyPressed = new Date()
let lastKey = ''


type ShortcutInfo = {
    keys: string[]
}

export interface BaseActionSpec {
    /**
     * A list of valid contexts this action should/shouldn't run in
     * e.g. ['-browser'] to never run while popup browser is open
     */
    contexts?: string[]
}
export interface TempActionSpec extends BaseActionSpec {
    defaultSetting: {
        keys: String[],
        doubleTap?: boolean
    },
    isTemp: true
    id: string
    title?: string
    action: Function
}
export interface ActionSpec extends BaseActionSpec  {
    title: string
    id: string

    /**
     * Any extra info to attach to the action that may
     * be helpful to event listeners etc
     */
    meta?: any
    
    action: Function
    
    defaultSetting?: {
        keys?: String[],
        doubleTap?: boolean
    }
    mod?: string
}   
type AnyActionSpec = ActionSpec | TempActionSpec

export class ShortcutsService extends BESService {
    popupService = getService<PopupService>("PopupService")

    browserIsOpen
    enteringValue = false
    spotlightOpen = false
    commanderOpen = false
    tabSwitcherOpen = false
    pausedHolders = 0

    mouseIsDownMightBeDragging = false

    newShortcutRegistry: {[actionId: string]: {action: ActionSpec, shortcutInfo: ShortcutInfo}} = {}
    newCache: {[shortcutCode: string]: Function[]} = {}
    pauseCacheUpdate = true

    settingsService = getService<SettingsService>('SettingsService')
    // searchWindow: BrowserWindow
    extraShortcuts: any[]
    events = {
        actionTriggered: makeEvent<AnyActionSpec>(),
        enteringValue: makeEvent<boolean>()
    }

    pause() {
        this.pausedHolders++
    }

    unpause() {
        this.pausedHolders--
    }

    setEnteringValue(value) {
        if (this.enteringValue !== value) {
            this.enteringValue = value
            this.log('Entering value: ' + value)
            this.events.enteringValue.emit(value)
        }
    }

    getApi() {
        const that = this
        return {
            get enteringValue() {
                return that.enteringValue
            },
            get spotlightOpen() {
                return that.spotlightOpen
            },
            get commanderOpen() {
                return that.commanderOpen
            },
            get tabSwitcherOpen() {
                return that.tabSwitcherOpen
            },
            anyModalOpen() {
                return that.enteringValue || that.spotlightOpen || that.commanderOpen || that.tabSwitcherOpen
            }
        }
    }

    makeShortcutValueCode = (value: ShortcutInfo) => {
        return value.keys.sort().join('')
    }

    setupPacketListeners() {
        interceptPacket('browser/state', undefined, ({ data: {isOpen} }) => {
            this.browserIsOpen = isOpen
            this.log('Browser is open: ' + this.browserIsOpen)
            if (isOpen) {
                this.setEnteringValue(false)
            }
        })
        this.settingsService.events.settingsUpdated.listen(() => this.updateCache())
    }

    isCurrentContextRunnable(contexts) {
        for (const context of contexts) {
            // this.log(`Context is: ${context} and browser is open: ${this.browserIsOpen}`)
            if (context === '-browser' && this.browserIsOpen)  {
                return false
            } else if (context === 'browser' && !this.browserIsOpen) {
                return false
            }
        }
        return true
    }

    maybeRunActionForState(state) {
        const code = this.makeShortcutValueCode(state)
        let ran = false
        this.log(`State code is ${code}`)
        if (code in this.newCache) {
            for (const func of this.newCache[code]) {
                try {
                    func({
                        keyState: state
                    })
                } catch (e) {
                    this.error(e)
                }
                ran = true
            }
        }
        return ran
    }

    runAction(actionId: string, ...args: any[]) {
        if (!this.newShortcutRegistry[actionId]) {
            this.error(`Requested to run ${actionId} but not found in registry`)
            return 
        }
        return this.newShortcutRegistry[actionId].action.action(...args)
    }

    addActionToShortcutRegistry(action: ActionSpec, shortcutInfo: ShortcutInfo) {
        this.newShortcutRegistry[action.id] = { action, shortcutInfo }
    }

    replaceActionIfExists(actionId: string, shortcutInfo: ShortcutInfo) {
        if (actionId in this.newShortcutRegistry) {
            this.newShortcutRegistry[actionId].shortcutInfo = shortcutInfo
        }
        this.updateCache()
    }

    removeActionFromShortcutRegistry(actionId: string) {
        delete this.newShortcutRegistry[actionId]
    }

    updateCache() {
        if (this.pauseCacheUpdate) {
            return
        }
        this.newCache = {}
        for (const {action, shortcutInfo} of Object.values(this.newShortcutRegistry)) {
            const code = this.makeShortcutValueCode(shortcutInfo)
            this.newCache[code] = (this.newCache[code] || []).concat(async (...args) => {
                if (action.contexts && !this.isCurrentContextRunnable(action.contexts)) {
                    return
                }
                try {
                    const result = await action.action(...args)
                    this.log(...args)
                    if (action) {
                        this.events.actionTriggered.emit(action, ...args)
                    }
                    return result
                } catch (e) {
                    this.error(`The following error occured while running action ${colors.green(action.id)} from mod ${colors.green(action.mod)}`)
                    throw e
                }
            })
        }
    }

    activate() {
        // this.searchWindow = new BrowserWindow({ 
        //     width: 370, 
        //     height: 480, 
        //     frame: false, 
        //     show: false,
        //     webPreferences: {
        //         enableRemoteModule: true,
        //         webSecurity: false,
        //         nodeIntegration: true,
        //     }
        // })
        // this.searchWindow.loadURL(url('/#/search'))

        this.setupPacketListeners()

        const getEventKeysArray = event => {
            const { lowerKey, Meta, Shift, Control, Alt } = event
            const keys = [lowerKey.length === 1 ? lowerKey.toUpperCase() : lowerKey]
            if (Meta) {
                keys.push('Meta')
            }
            if (Shift) {
                keys.push('Shift')
            }
            if (Control) {
                keys.push('Control')
            }
            if (Alt) {
                keys.push('Alt')
            }
            return keys.reverse()
        }   

        let shortcutCodeWhileMouseDown = ''
        let previousEvent

        Keyboard.on('keyup', event => {
            if (previousEvent && event.lowerKey === previousEvent.lowerKey) {
                previousEvent = null
            }
        })
        Keyboard.on('keydown', event => {
            try {
                if (this.pausedHolders > 0) {
                    return
                }

                if (isPreferencesActive()) {
                    return
                }

                let { lowerKey, nativeKeyCode, Meta, Shift, Control, Alt, Fn } = event
                if (/F[0-9]+/.test(lowerKey) || lowerKey === 'Clear' || lowerKey.indexOf('Arrow') === 0) {
                    // FN defaults to true when using function keys (makes sense I guess?), but also Clear???
                    Fn = false
                }

                let keys = getEventKeysArray(event)
                let partialState = {
                    keys,
                    fn: Fn
                }

                if (previousEvent 
                    && previousEvent.lowerKey === lowerKey 
                    && (Meta || Shift || Alt || Control) 
                    && (!previousEvent.Meta && !previousEvent.Shift && !previousEvent.Control && !previousEvent.Alt)) {
                        // Don't process events that are J+Cmd rather than Cmd+J. Wait for lowerKey to change first
                        return
                }
                previousEvent = event

                // Don't process shortcuts when dragging (this was to stop shift + 2 being picked up as a shortcut when dragging to make
                // an off-grid time selection)
                if (this.mouseIsDownMightBeDragging && !isNaN(parseInt(event.lowerKey, 10)) && !(Meta || Shift || Alt || Control)) {
                    // Also store code pressed while dragging so that upon release the shortcut doesn't get triggered until next keypress
                    // (as keydown events will continue to come in as key repeats)
                    shortcutCodeWhileMouseDown = this.makeShortcutValueCode(partialState)
                    return
                }

                if (this.makeShortcutValueCode(partialState) === shortcutCodeWhileMouseDown){
                    return
                } else {
                    // It's ok, dragging has stopped and we can process other keyboard shortcuts
                    shortcutCodeWhileMouseDown = ''
                }

                if (this.commanderOpen) {
                    if (lowerKey === 'Escape' || lowerKey.indexOf('Enter') >= 0) {
                        this.log('Commander is closed')
                        this.commanderOpen = false
                        return // Don't process the enter/escape event internally
                    } else {
                        return
                    }
                }

                if (this.spotlightOpen) {
                    if (lowerKey === 'Escape' || lowerKey.indexOf('Enter') >= 0) {
                        this.log('Spotlight is closed')
                        this.spotlightOpen = false
                        return // Don't process the enter/escape event internally
                    } else {
                        return
                    }
                }

                // this.log(event, Bitwig.isActiveApplication())

                // Keep track of whether an action itself declares that we are entering a value (e.g entering automation)
                let enteringBefore = this.enteringValue

                if (lowerKey === 'Space' && Meta && !Shift && !Control && !Alt) {
                    this.log('Spotlight is open')
                    this.spotlightOpen = true
                    return
                }
                if (lowerKey === 'Enter' && Control && !Shift && !Meta && !Alt) {
                    this.log('Commander is open')
                    this.commanderOpen = true
                    return
                }

                if ((Bitwig.isActiveApplication() || this.popupService.clickableCanvas.window.isFocused()) && !this.enteringValue) {
                    const asJSON = JSON.stringify(keys)
                    this.log(asJSON)

                    let ranDouble = false
                    if (asJSON === lastKey && new Date().getTime() - lastKeyPressed.getTime() < 250) {
                        // Double-tapped, check for shortcut
                        lastKey = ''
                        lastKeyPressed = new Date(0)
                        ranDouble = this.maybeRunActionForState({
                            ...partialState,
                            doubleTap: true
                        })
                    } 
                    if (!ranDouble) {
                        // Single tap
                        lastKey = asJSON
                        lastKeyPressed = new Date()
                        // Uncomment to debug error messages that crash NAPI
                        // setTimeout(() => {
                            this.maybeRunActionForState({
                                ...partialState,
                                doubleTap: false
                            })
                        // }, 100)
                    }
                }

                // Prevent shortcuts from triggering when renaming something
                if (Bitwig.isActiveApplication() && lowerKey === 'r' && Meta && !Shift && !Alt) {
                    this.setEnteringValue(true)
                } else if ((enteringBefore === this.enteringValue) && (lowerKey === 'Enter' || lowerKey === 'Escape' || lowerKey === "NumpadEnter")) {
                    this.setEnteringValue(false)
                }
            } catch (e) {
                console.error(e)
            }
        })
    }

    postActivate() {
        const uiService = getService<UIService>("UIService")
        uiService.Mouse.on('mouseup', event => {
            this.setEnteringValue(false)
            this.mouseIsDownMightBeDragging = false
        })
        uiService.Mouse.on('mousedown', event => {
            this.mouseIsDownMightBeDragging = true
        })
    }
}
