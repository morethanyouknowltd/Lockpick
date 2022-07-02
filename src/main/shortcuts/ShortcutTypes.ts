import { MaybePromise } from '@mtyk/types'

export type ShortcutInfo = {
  keys: string[]
  special: string
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
    keys: String[]
    doubleTap?: boolean
  }
  isTemp: true
  id: string
  title?: string
  action: Function
}
export interface ActionSpec extends BaseActionSpec {
  title: string
  category?: string
  description?: string
  id: string

  /**
   * Any extra info to attach to the action that may
   * be helpful to event listeners etc
   */
  meta?: any

  action: () => MaybePromise<void>

  defaultSetting?: {
    keys?: String[]
    doubleTap?: boolean
  }
  mod?: string
}
export type AnyActionSpec = ActionSpec | TempActionSpec
