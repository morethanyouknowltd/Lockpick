import { applySerializedActionAndSyncNewModelIds, fromSnapshot } from 'mobx-keystone'
import { loadModels, RootState } from '../../../connector/shared/state/rootStore'
import { addPacketListener, callAPI } from '../../bitwig-api/Bitwig'

let serverAction = false
let korusState: RootState | undefined = undefined

loadModels()

export default function getKorusState(): RootState {
  if (!korusState) {
    throw new Error('Korus state is not initialized')
  }
  return korusState!
}

export function createRootState(cb) {
  callAPI('api/korus/initial-state').then(data => {
    korusState = fromSnapshot<RootState>(data)
    cb(korusState)

    // also listen to local actions, cancel them and send them to the server
    // onActionMiddleware(korusState, {
    //   onStart(actionCall, ctx) {
    //     if (!serverAction) {
    //       // If the action does not come from the server cancel it silently
    //       // and send it to the server
    //       // It will then be replicated by the server and properly executed
    //       callAPI('/api/korus/message', serializeActionCall(actionCall, korusState!))

    //       // Cancel the action by returning undefined
    //       return {
    //         result: ActionTrackingResult.Return,
    //         value: undefined,
    //       }
    //     }
    //   },
    // })

    addPacketListener(`korus/state-message`, ({ data: actionCall, type }) => {
      let wasServerAction = serverAction
      serverAction = true
      try {
        // in clients we use the sync new model ids version to make sure that
        // any model ids that were generated in the server side end up being
        // the same in the client side

        applySerializedActionAndSyncNewModelIds(korusState!, actionCall)
      } catch (e) {
        console.error(e)
      } finally {
        serverAction = wasServerAction
      }
    })
  })
}
