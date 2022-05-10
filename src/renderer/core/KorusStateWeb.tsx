import {
  ActionTrackingResult,
  applySerializedActionAndSyncNewModelIds,
  fromSnapshot,
  onActionMiddleware,
  serializeActionCall,
  SerializedActionCallWithModelIdOverrides,
} from 'mobx-keystone'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { BitwigState } from '../../connector/shared/state/BitwigState'
// import { cancelledActionSymbol, LogsView } from "../todoList/logs"
import { RootState } from '../../connector/shared/state/rootStore'
import { addPacketListener, callAPI } from '../bitwig-api/Bitwig'

let serverAction = false
function useKorusState() {
  // we get the snapshot from the server, which is a serializable object

  const testState = new RootState({
    bitwig: new BitwigState({
      activeProject: undefined,
      projects: [],
      projectTracks: [],
      actions: [],
      settings: [],
    }),
  })

  let [korusState, setKorusState] = useState<RootState | undefined>(undefined)
  const runServerActionLocally = (actionCall: SerializedActionCallWithModelIdOverrides) => {
    let wasServerAction = serverAction
    serverAction = true
    try {
      // in clients we use the sync new model ids version to make sure that
      // any model ids that were generated in the server side end up being
      // the same in the client side
      applySerializedActionAndSyncNewModelIds(korusState, actionCall)
    } finally {
      serverAction = wasServerAction
    }
  }

  useEffect(() => {
    const packetListener = addPacketListener(`korus/state-message`, ({ data: action, type }) => {
      runServerActionLocally(action)
    })
    callAPI('api/korus/initial-state').then(data => {
      alert('here is the state', JSON.stringify(data))
      try {
        const rootStore = fromSnapshot<RootState>(data)
      } catch (e) {
        alert('error' + e)
      }

      setKorusState(rootStore)

      alert('we set the state')
      // also listen to local actions, cancel them and send them to the server
      onActionMiddleware(rootStore, {
        onStart(actionCall, ctx) {
          if (!serverAction) {
            // if the action does not come from the server cancel it silently
            // and send it to the server
            // it will then be replicated by the server and properly executed
            callAPI('/api/korus/message', serializeActionCall(actionCall, rootStore))
            // "cancel" the action by returning undefined
            return {
              result: ActionTrackingResult.Return,
              value: undefined,
            }
          } else {
            // just run the server action unmodified
            return undefined
          }
        },
      })
    })

    return packetListener
  }, [])

  return korusState
}

export const KorusView = observer(() => {
  const state = useKorusState()
  if (state) {
    return <div>We have state!</div>
  } else {
    return <div>Loading...</div>
  }
})
