import {
  ActionTrackingResult,
  applySerializedActionAndTrackNewModelIds,
  getSnapshot,
  ModelData,
  onActionMiddleware,
  serializeActionCall,
  SerializedActionCall,
  SerializedActionCallWithModelIdOverrides,
} from 'mobx-keystone'
import { createRootStore, RootState } from './rootStore'
import { logger as mainLogger } from '../../../main/core/Log'

type MsgListener = (actionCall: SerializedActionCallWithModelIdOverrides) => void

const logger = mainLogger.child('korusStateServer')
export default class KorusStateServer {
  private serverRootStore: ReturnType<typeof createRootStore>
  private msgListeners: MsgListener[] = []
  clientAction = false
  constructor(rootData: ModelData<RootState>) {
    this.serverRootStore = createRootStore(rootData)
    onActionMiddleware(this.serverRootStore, {
      onFinish: (actionCall, ctx) => {
        console.log('did it finish?')
        logger.info(`Ran ${ctx.actionName} on server, sending to client`)
        if (!this.clientAction) {
          // if the action does not come from the server cancel it silently
          // and send it to the server
          // it will then be replicated by the server and properly executed
          this.sendToClient(serializeActionCall(actionCall, this.serverRootStore))
        }
      },
    })
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

  sendToClient(actionCall: SerializedActionCall) {
    // apply the action over the server root store
    // sometimes applying actions might fail (for example on invalid operations
    // such as when one client asks to delete a model from an array and other asks to mutate it)
    // so we try / catch it
    let serializedActionCallToReplicate: SerializedActionCallWithModelIdOverrides | undefined
    this.clientAction = true
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
    this.clientAction = false

    if (serializedActionCallToReplicate) {
      // and distribute message, which includes new model IDs to keep them in sync
      this.msgListeners.forEach(listener => listener(serializedActionCallToReplicate!))
    }
  }
}
