import { InstanceOf } from 'ts-morph'
import { RootState } from '../../connector/shared/state/rootStore'
import { logger } from './Log'
export * from '@mtyk/events'

const servicesByName: { [name: string]: BESService } = {}

export class BESService {
  logger: ReturnType<typeof logger.child>
  name: string
  constructor(name?: string) {
    name = name || this.constructor.name
    this.name = name
    this.logger = logger.child({ service: name })
    servicesByName[name] = this
  }

  updateStore(cb: (state: RootState) => void) {
    const stateService = getService('StateService') as any
    if (stateService?.server?.store) {
      cb(stateService.server.store)
    } else {
      console.log('State service not ready')
    }
  }

  /**
   * Try not to run any long-running tasks in activate as this will slow down app startup and
   * make it unresponsive
   */
  activate(): any {}

  postActivate(): any {}

  verbose(...args: any[]) {
    this.logger.verbose(args)
  }
  debug(...args: any[]) {
    this.logger.debug(args)
  }
  log(...args: any[]) {
    this.logger.info(args)
  }
  info(...args: any[]) {
    this.logger.info(args)
  }
  warn(...args: any[]) {
    this.logger.warn(args)
  }
  error(...args: any[]) {
    this.logger.error(args)
  }
}

export function getService<T>(name: string | T): InstanceOf<T> {
  return servicesByName[typeof name === 'string' ? name : (name as any).name] as any
}
