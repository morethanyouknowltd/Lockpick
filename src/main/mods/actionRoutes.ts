import { assertIsDefined } from '@mtyk/util'
import { getService } from '../core/Service'
import { addAPIMethod } from '../core/WebsocketToSocket'
import { StateService } from '../state/StateService'
import cloneModToLocal from './actions/cloneModToLocal'
import updateMod from './actions/updateMod'
import * as t from 'typed-assert'
import findModById from './helpers/findModById'

export default function modsActionRoutes() {
  const stateService = getService(StateService)

  const map = {
    'mods/clone-local': async ({ id }) => {
      const mod = findModById(id)
      t.isNotUndefined(mod)
      await cloneModToLocal(mod)
    },
    'mods/update': async ({ id, update }) => {
      const mod = findModById(id)
      t.isNotUndefined(mod)
      await updateMod(mod, update)
    },
  }

  for (const [key, value] of Object.entries(map)) {
    addAPIMethod(key, value)
  }
}
