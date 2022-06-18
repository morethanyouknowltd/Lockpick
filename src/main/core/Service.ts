import { InstanceOf } from 'ts-morph'
import { RootState } from '../../connector/shared/state/rootStore'
import { logger } from './Log'

export class EventEmitter<T> {
  nextId = 0
  listenersById: { [id: number]: (...values: [T, ...any[]]) => void } = {}
  listen(cb: (data: T) => void) {
    let nowId = this.nextId++
    this.listenersById[nowId] = cb
    return nowId
  }
  stopListening(id: number) {
    delete this.listenersById[id]
  }
  emit(...values: [T, ...any[]]) {
    for (const listener of Object.values(this.listenersById)) {
      // logWithTime('Emitting to listener' + listener.toString())
      listener(...values)
    }
  }
}

export class EventRouter<T> {
  nextId = 0
  mutedEvents = {}
  muteEvent(eventName: string) {
    this.mutedEvents[eventName] = true
  }
  unmuteEvent(eventName: string) {
    delete this.mutedEvents[eventName]
  }
  listenersByEvent: { [event: string]: { [id: number]: Function } } = {}
  on(eventName: string, cb: (data: T) => void) {
    if (!this.listenersByEvent[eventName]) {
      this.listenersByEvent[eventName] = {}
    }
    let id = this.nextId++
    this.listenersByEvent[eventName][id] = cb
    return id
  }
  off(eventName: string, id: number) {
    if (this.listenersByEvent[eventName]) {
      delete this.listenersByEvent[eventName][id]
    }
  }
  emit(eventName: string, ...values: any[]) {
    if (eventName in this.mutedEvents) {
      return logger.info(`Event ${eventName} was muted`)
    }
    for (const cb of Object.values(this.listenersByEvent[eventName] || {})) {
      cb(...values)
    }
  }
}

export function makeEvent<T>(): EventEmitter<T> {
  return new EventEmitter()
}

const servicesByName: { [name: string]: BESService } = {}

export class BESService {
  logger: ReturnType<typeof logger.child>
  constructor(public readonly name: string) {
    this.logger = logger.child({ service: name })
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

/**
 * Creates a shared instance of a service and runs
 * its "activate" function
 */
export async function registerService<T>(service: Function): Promise<T> {
  const instance = new (service as any)()
  servicesByName[service.name] = instance
  const res = instance.activate()
  if (res?.then) {
    await res
  }
  return instance
}

export function getService<T>(name: string | T): InstanceOf<T> {
  return servicesByName[typeof name === 'string' ? name : (name as any).name] as any
}
