import {
  ActionTrackingResult,
  applySerializedActionAndSyncNewModelIds,
  fromSnapshot,
  onActionMiddleware,
  serializeActionCall,
} from 'mobx-keystone'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { BitwigState } from '../../connector/shared/state/models/BitwigTrack.model'
// import { cancelledActionSymbol, LogsView } from "../todoList/logs"
import { RootState } from '../../connector/shared/state/rootStore'
import { addPacketListener, callAPI } from '../bitwig-api/Bitwig'

let serverAction = false
let korusState = null
function useKorusState() {
  // Keep this otherwise the import to RootState gets automatically removed
  const testState = new RootState({
    bitwig: new BitwigState({
      tracks: [],
    }),
  })

  let [korusChangedCount, setKorusChangeCount] = useState(0)
  useEffect(() => {
    let listeners = []
    callAPI('api/korus/initial-state').then(data => {
      try {
        const rootStore = fromSnapshot<RootState>(data)
        korusState = rootStore
        setKorusChangeCount(1)

        // also listen to local actions, cancel them and send them to the server
        onActionMiddleware(rootStore, {
          onStart(actionCall, ctx) {
            if (!serverAction) {
              // If the action does not come from the server cancel it silently
              // and send it to the server
              // It will then be replicated by the server and properly executed
              callAPI('/api/korus/message', serializeActionCall(actionCall, rootStore))

              // Cancel the action by returning undefined
              return {
                result: ActionTrackingResult.Return,
                value: undefined,
              }
            }
          },
        })

        listeners.push(
          addPacketListener(`korus/state-message`, ({ data: actionCall, type }) => {
            let wasServerAction = serverAction
            serverAction = true
            try {
              // in clients we use the sync new model ids version to make sure that
              // any model ids that were generated in the server side end up being
              // the same in the client side
              applySerializedActionAndSyncNewModelIds(korusState, actionCall)
            } finally {
              serverAction = wasServerAction
              setKorusChangeCount(korusChangedCount + 1)
            }
          })
        )
      } catch (e) {
        alert('error' + e)
      }
    })
    return () => listeners.forEach(l => l())
  }, [])

  return korusState
}

export const KorusView = observer(() => {
  const state = useKorusState()
  if (state) {
    return <div>{JSON.stringify(state)}</div>
  } else {
    return <div>Loading...</div>
  }
})
