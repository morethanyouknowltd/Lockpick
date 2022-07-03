/// <reference types="node" />
declare const _: any
declare const Popup: {
  openPopup: (popup: PopupSpec) => void
  closePopup: (...args: any[]) => void
  closeAll: () => void
}
declare const id: number
declare const log: (...args: any[]) => void
declare const error: (...args: any[]) => void
declare const Keyboard: any
declare const Shortcuts: {
  readonly enteringValue: boolean
  readonly spotlightOpen: boolean
  readonly commanderOpen: boolean
  readonly tabSwitcherOpen: boolean
  anyModalOpen(): boolean
}
declare const whenActiveListener: (cb: Function) => (...args: any[]) => any
declare const Rect: {
  containsPoint: (rect: any, point: any) => boolean
  containsX: (rect: any, x: any) => boolean
  containsY: (rect: any, y: any) => boolean
}
declare const Mouse: any
declare const UI: any
declare const Bitwig: any
declare const MainDisplay: { getDimensions(): any }
declare const Db: {
  getData: () => Promise<any>
  setData: (data: any) => Promise<void>
  getTrackData: (name: string, options?: { modId?: string | undefined }) => Promise<any>
  setCurrentProjectData: (data: any) => Promise<null | undefined>
  getCurrentProjectData: () => Promise<any>
  setTrackData: (name: string, data: any) => Promise<void> | null
  setExistingTracksData: (data: any, exclude?: string[]) => Promise<null | undefined>
  getCurrentTrackData: () => Promise<any>
  setCurrentTrackData: (data: any) => Promise<void> | null
}
declare const Mod: {
  on: (eventName: 'actionTriggered', cb: Function) => any
  once: (eventName: 'actionTriggered', cb: Function) => void
  off: (eventName: 'actionTriggered', id: number) => void
  hostVersion: string
  id: any
  setEnteringValue: (isEnteringValue: boolean) => void
  runAction: (actionId: string, ...args: any[]) => any
  runActions: (...actionIds: string[]) => void
  registerActionCategory: (categoryDetails: any) => any
  registerSetting: (settingSpec: any) => Promise<{
    value: boolean
    getValue: () => Promise<any>
    setValue: (value: any) => Promise<void>
    toggleValue: () => Promise<void>
  }>
  registerAction: (action: ActionSpec) => Promise<void>
  registerActionsWithRange: (
    name: string,
    start: number,
    end: number,
    cb: (i: number) => ActionSpec
  ) => void
  _registerShortcut: (keys: string[], runner: Function) => void
  registerShortcutMap: (shortcutMap: any) => void
  setInterval: (fn: any, ms: any) => 0 | Timeout
  isActive: boolean
  onExit: (cb: any) => void
  getClipboard(): string
  interceptPacket: (type: string, ...rest: any[]) => void
}
declare const debounce: (fn: any, wait?: number) => (...args: any[]) => void
declare const throttle: any
declare const showNotification: (notif: any) => void
interface PopupSpec {
  /**
   * Unique id for this popup. When opening a popup with the same id as one already existing,
   * it will be replaced. Otherwise, a new popup will be created
   */
  id: string
  component: String
  props: any
  rect: { x: number; y: number; w: number; h: number }
  onReceivedData?: Function

  /**
   * Defaults to false, whether the popup should stay onscreen
   * even when "closeAll" methods are called
   */
  persistent?: boolean

  /**
   * Defaults to false, whether the popup should be clickable
   */
  clickable?: boolean

  /**
   * Defaults to 3000, only releveant for non-clickable popups
   */
  timeout?: number
}
interface BaseActionSpec {
  /**
   * A list of valid contexts this action should/shouldn't run in
   * e.g. ['-browser'] to never run while popup browser is open
   */
  contexts?: string[]
}
interface ActionSpec extends BaseActionSpec {
  title: string
  category?: string
  description?: string
  id: string

  /**
   * Any extra info to attach to the action that may
   * be helpful to event listeners etc
   */
  meta?: any

  action: Function

  defaultSetting?: {
    keys?: String[]
    doubleTap?: boolean
  }
  mod?: string
}
