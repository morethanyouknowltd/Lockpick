import { Injectable } from '@nestjs/common'
import { fromSnapshot } from 'mobx-keystone'
import KorusStateServer from '../../connector/shared/state/KorusStateServer'
import { BitwigState } from '../../connector/shared/state/models/BitwigTrack.model'
import { ModsState } from '../../connector/shared/state/models/Mod.model'
import { RootState } from '../../connector/shared/state/rootStore'
import { jsonPath } from '../config'
import { BESService } from '../core/Service'
import { addAPIMethod, interceptPacket, sendPacketToBrowser } from '../core/WebsocketToSocket'

@Injectable()
export class StateService extends BESService {
  server: KorusStateServer
  bitwigUpdateInterval: any
  constructor() {
    super('state')
  }

  postActivate() {
    const dbLocation = jsonPath
    let initialState = new RootState({
      bitwig: new BitwigState({}),
      mods: new ModsState({}),
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
    addAPIMethod('api/korus/message', async (message: any) => {
      this.server.sendToClient(message)
    })
    addAPIMethod('api/korus/initial-state', async () => {
      return this.server.getInitialState()
    })

    interceptPacket('browser/state', undefined, ({ data }) => {
      console.log(data)
    })
    interceptPacket('transport/state', undefined, ({ data: state }) => {
      console.log(state)
    })
  }
}
