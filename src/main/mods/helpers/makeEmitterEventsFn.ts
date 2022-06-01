import { EventEmitter } from '../../core/Service'
import logForMod from './logForMod'
const colors = require('colors')

const makeEmitterEvents = <Keys extends string>(
  { mod, onReloadMods },
  mapOfKeysAndEmitters: {
    [K in Keys]: EventEmitter<any>
  }
) => {
  const handlers: {
    [K in Keys]: {
      on: (cb: (data: any) => void) => any
      off: (id: any) => void
    }
  } = {} as any

  for (const key in mapOfKeysAndEmitters) {
    const emitter = mapOfKeysAndEmitters[key]
    handlers[key] = {
      on: (cb: (data: any) => void) => {
        if (!mod.enabled) {
          return
        }
        let id = emitter.listen(cb)
        onReloadMods.push(() => {
          handlers[key].off(id)
        })
        return id
      },
      off: id => {
        if (!mod.enabled) {
          return
        }
        // console.log('Removing listener id:' + id)
        emitter.stopListening(id)
      },
    }
  }
  const out = {
    on: (eventName: Keys, cb: Function) => {
      if (!mod.enabled) {
        return () => {}
      }
      const wrappedCb = (...args) => {
        try {
          cb(...args)
        } catch (e) {
          logForMod(mod.id, 'error', colors.red(e))
        }
      }
      return handlers[eventName].on(wrappedCb)
    },
    once: (eventName: Keys, cb: Function) => {
      if (!mod.enabled) {
        return
      }
      const id = out.on(eventName, (...args) => {
        out.off(eventName, id)
        cb(...args)
      })
    },
    off: (eventName: Keys, id: number) => {
      if (!mod.enabled) {
        return
      }
      handlers[eventName].off(id)
    },
  }
  return out
}

export default makeEmitterEvents
