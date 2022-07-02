import { getService } from '../../core/Service'
import { StateService } from '../../state/StateService'

export default function findModById(id: string) {
  const stateService = getService(StateService)
  return stateService.server.store.mods.mods.find(mod => mod.id === id)
}
