export interface EventListener<Events extends string = any> {
  (event: Events, data: any): void
}

export default class EventListenable<Events extends string = any> {
  private eventListeners: {
    [event: string]: { listener: EventListener; id: number }[]
  } = {}
  nextId = 0
  public listen(eventName: Events, listener: EventListener<Events>) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = []
    }
    const id = ++this.nextId
    this.eventListeners[eventName].push({
      id,
      listener,
    })
    return () => this.removeListener(eventName, id)
  }

  public removeListener(eventName: Events, id: number) {
    if (!this.eventListeners[eventName]) {
      return
    }
    this.eventListeners[eventName] = this.eventListeners[eventName].filter(
      (l) => l.id !== id
    )
  }
  emit(eventName: Events, data: any) {
    if (!this.eventListeners[eventName]) {
      return
    }
    this.eventListeners[eventName].forEach((l) => l.listener(eventName, data))
  }
}
