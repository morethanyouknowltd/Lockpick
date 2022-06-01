import {
  applySerializedActionAndTrackNewModelIds,
  getSnapshot,
  ModelData,
  SerializedActionCall,
  SerializedActionCallWithModelIdOverrides,
} from 'mobx-keystone'
import { createRootStore, RootState } from './rootStore'

type MsgListener = (actionCall: SerializedActionCallWithModelIdOverrides) => void

export default class KorusStateServer {
  private serverRootStore: ReturnType<typeof createRootStore>
  private msgListeners: MsgListener[] = []

  constructor(rootData: ModelData<RootState>) {
    this.serverRootStore = createRootStore(rootData)
  }

  get store() {
    return this.serverRootStore
  }

  getInitialState() {
    return getSnapshot(this.serverRootStore)
  }

  addMessageListener(listener: (actionCall: SerializedActionCallWithModelIdOverrides) => void) {
    this.msgListeners.push(listener)
  }

  applyAction(actionCall: SerializedActionCall) {
    // apply the action over the server root store
    // sometimes applying actions might fail (for example on invalid operations
    // such as when one client asks to delete a model from an array and other asks to mutate it)
    // so we try / catch it
    let serializedActionCallToReplicate: SerializedActionCallWithModelIdOverrides | undefined
    try {
      // we use this to apply the action on the server side and keep track of new model IDs being
      // generated, so the clients will have the chance to keep those in sync
      const applyActionResult = applySerializedActionAndTrackNewModelIds(
        this.serverRootStore,
        actionCall
      )
      serializedActionCallToReplicate = applyActionResult.serializedActionCall
    } catch (err) {
      console.error('error applying action to server:', err)
    }

    if (serializedActionCallToReplicate) {
      // and distribute message, which includes new model IDs to keep them in sync
      this.msgListeners.forEach(listener => listener(serializedActionCallToReplicate!))
    }
  }
}
