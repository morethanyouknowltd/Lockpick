import { MTYKService } from '@mtyk/service'
import { InstanceOf } from 'ts-morph'
import { RootState } from '../../connector/shared/state/rootStore'
import { logger } from './Log'
export * from '@mtyk/events'

const servicesByName: { [name: string]: BESService } = {}

export class BESService extends MTYKService {
  logger: ReturnType<typeof logger.child>
  name: string
  constructor(name?: string) {
    super(name)
    const _name = name ?? this.constructor.name
    this.logger = logger.child({ service: _name })
    servicesByName[_name] = this
  }

  updateStore(cb: (state: RootState) => void) {
    const stateService = getService('StateService') as any
    if (stateService?.server?.store) {
      cb(stateService.server.store)
    } else {
      console.log('State service not ready')
    }
  }
}

export function getService<T>(name: string | T): InstanceOf<T> {
  return servicesByName[typeof name === 'string' ? name : (name as any).name] as any
}
