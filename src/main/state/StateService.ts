import { fromSnapshot, ModelData } from 'mobx-keystone'
import { BitwigState } from '../../connector/shared/state/BitwigState'
import KorusStateServer from '../../connector/shared/state/KorusStateServer'
import { RootState } from '../../connector/shared/state/rootStore'
import { jsonPath } from '../config'
import { BESService } from '../core/Service'
import { addAPIMethod, sendPacketToBrowser } from '../core/WebsocketToSocket'

export class StateService extends BESService {
  server: KorusStateServer
  constructor() {
    super('state')
  }

  activate() {
    const dbLocation = jsonPath
    let initialState = new RootState({
      bitwig: new BitwigState({
        actions: [],
        projects: [],
        projectTracks: [],
        settings: [],
        activeProject: undefined,
      }),
    })
    try {
      const data = require(dbLocation)
      initialState = fromSnapshot(RootState, data as any)
    } catch (e) {
      console.error(e)
    }

    this.server = new KorusStateServer(initialState)
    this.server.addMessageListener(message => {
      sendPacketToBrowser({
        type: 'korus/state-message',
        data: message,
      })
    })
    addAPIMethod('api/korus/message', (message: any) => {
      this.server.applyAction(message)
    })
    addAPIMethod('api/korus/initial-state', () => {
      return this.server.getInitialState()
    })
  }

  postActivate() {
    super.postActivate()
  }
}
