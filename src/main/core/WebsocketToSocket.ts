import { Injectable } from '@nestjs/common'
import { SerializedActionCallWithModelIdOverrides } from 'mobx-keystone'
import { SOCKET_PORT, WEBSOCKET_PORT } from '../../connector/shared/Constants'
import { logger } from './Log'
import { BESService, getService, makeEvent } from './Service'
const { Bitwig } = require('bindings')('bes')
const async = require('async')
const WebSocket = require('ws')
const net = require('net')
const logInOut = true
const RECONNECT_IN = 1000 * 3

let nextId = 0
let waiting = 0
let partialMsg = ''
let bitwigClient: any = null

type WebsocketData = { ws: any; id: number } & any
let activeWebsockets: WebsocketData[] = []
let nextPacketId = 0
let waitingForResponseById: { [id: string]: Function } = {}
/**
 * We have to have a queue here because our interceptors can be async, which means our
 * data processor could end up out of order (as we process multiple packets in one function call)
 */
const bitwigToClientQueue = async.queue(async function ({ data }: any, callback: () => void) {
  let leftToParse = data.toString()
  while (leftToParse.length > 0) {
    if (waiting === 0) {
      waiting = parseInt(leftToParse, 10)
      partialMsg = ''
      leftToParse = leftToParse.substr(String(waiting).length)
      // logWithTime("waiting on " + waiting)
    }
    let thisTime = leftToParse.substr(0, waiting)
    leftToParse = leftToParse.substr(waiting)
    partialMsg += thisTime
    waiting -= thisTime.length
    if (waiting === 0) {
      if (logInOut) logger.info('Bitwig sent: ' + partialMsg.substr(0, 50))
      try {
        partialMsg = (await processInterceptors(partialMsg, fromBWInterceptors)).string
      } catch (e) {
        logger.error('Error intercepting packet', e)
      }
      activeWebsockets.forEach(info => info.ws.send(partialMsg))
      partialMsg = ''
    }
  }
  if (typeof callback === 'function') {
    callback()
  }
}, 1)

type BitwigToClientInterceptorResponse = { modified: boolean } | void
type BitwigToClientInterceptor = {
  id: string
  handler: (
    packet: any
  ) => BitwigToClientInterceptorResponse | Promise<BitwigToClientInterceptorResponse>
}
type ClientToBitwigInterceptor = {
  id: string
  handler: (packet: any, websocket?: WebsocketData) => any
}
let toBWInterceptors: { [type: string]: ClientToBitwigInterceptor[] } = {}
let fromBWInterceptors: { [type: string]: BitwigToClientInterceptor[] } = {}

async function processInterceptors(
  packetStr: string,
  ceptors: { [type: string]: (ClientToBitwigInterceptor | BitwigToClientInterceptor)[] },
  websocketSrc?: WebsocketData
) {
  const packet = JSON.parse(packetStr)
  if (packet.id in waitingForResponseById) {
    try {
      waitingForResponseById[packet.id](packet)
    } catch (e) {
      logger.error(e)
    }
    delete waitingForResponseById[packet.id]
  }

  let didIntercept = false

  const packetInterceptors = ceptors[packet.type] ?? []
  console.log(packetInterceptors)
  if (packetInterceptors.length) {
    const ceptorsForPacket = ceptors[packet.type]
    for (const cept of ceptorsForPacket) {
      try {
        let out = cept.handler(packet, websocketSrc)
        // If our cb was async, wait for it to finish
        if (out && (out as any).then) {
          out = await out
        }
        didIntercept = didIntercept || (out as any)?.modified
      } catch (e) {
        logger.error('Error in interceptor for packet: ', packet, cept.handler.toString())
        throw e
      }
    }
  }
  // Don't waste time re-stringifying if nothing changed
  return {
    string: didIntercept ? JSON.stringify(packet) : packetStr,
    parsedBefore: packet,
  }
}

@Injectable()
export class SocketMiddlemanService extends BESService {
  events = {
    connected: makeEvent<boolean>(),
  }
  bitwigConnected: boolean = false

  getActiveWebsockets() {
    return activeWebsockets
  }

  async onModuleInit() {
    this.log('Activating Socket...')
    const wss = new WebSocket.Server({ port: WEBSOCKET_PORT })
    const connectBitwig = () => {
      this.log('Connecting to Bitwig...')
      try {
        bitwigClient = new net.Socket()
        bitwigClient.connect(SOCKET_PORT, '127.0.0.1', () => {
          this.log('Connected to Bitwig')
          // showMessage('Connected to Bitwig')
          this.events.connected.emit(true)
          this.bitwigConnected = true
        })
        bitwigClient.on('data', (data: any) => bitwigToClientQueue.push({ data }))
        bitwigClient.on('error', (err: any) => {
          logger.error(err)
        })
        bitwigClient.on('close', () => {
          this.log('Connection to Bitwig closed, reconnecting...')
          // showMessage('Connection to Bitwig closed, reconnecting...')
          this.bitwigConnected = false
          bitwigClient = null
          this.events.connected.emit(false)
          waiting = 0
          setTimeout(() => {
            connectBitwig()
          }, RECONNECT_IN)
        })
      } catch (e) {
        logger.error(e)
        setTimeout(() => {
          connectBitwig()
        }, RECONNECT_IN)
      }
    }
    connectBitwig()

    wss.on('connection', ws => {
      const id = nextId++
      let socketData: WebsocketData = {
        ws,
        id,
        send: (obj: any) => {
          const toSend = JSON.stringify(obj)
          this.log(`Sending to specific websocket (${id}): `, toSend)
          ws.send(toSend)
        },
      }
      activeWebsockets.push(socketData)
      this.log(`Browser connected (${id})`)
      ws.on('message', async (messageFromBrowser: any) => {
        if (logInOut) this.log('Browser sent: ', messageFromBrowser)
        try {
          const { parsedBefore } = await processInterceptors(
            messageFromBrowser,
            toBWInterceptors,
            socketData
          )
          if (parsedBefore.type.split('/')[0] === 'api') {
            console.log('not sending to bitwig, prefixed with api')
            // No need to do anything
          } else {
            sendToBitwig(messageFromBrowser)
          }
        } catch (e) {
          console.error(e)
          logger.error('Invalid packet from browser', messageFromBrowser, e)
        }
      })
      ws.on('close', () => {
        this.log(`Connection to browser lost (${id})`)
        activeWebsockets = activeWebsockets.filter(info => info.id !== id)
      })
    })
  }

  sendPacketToBrowser<Packet extends { type: string; data?: any }>(packet: Packet) {
    sendPacketToBrowser(packet)
  }
}

function sendToBitwig(str: string) {
  if (bitwigClient && getService(SocketMiddlemanService).bitwigConnected) {
    const buff = Buffer.from(str, 'utf8')
    const sizeBuf = Buffer.alloc(4)
    sizeBuf.writeInt32BE(str.length, 0)
    try {
      if (logInOut) logger.info('Sending to bitwig: ', str)
      bitwigClient.write(Buffer.concat([sizeBuf, buff]))
    } catch (e) {
      logger.error(e)
    }
  } else {
    throw new Error('Bitwig not connected')
  }
}

export function sendPacketToBitwig(
  packet: { type?: string; data?: { [x: string]: any }; id?: any },
  cb?: Function
) {
  if (cb) {
    let packetId = `internal` + nextPacketId++
    packet.id = packetId
    waitingForResponseById[packetId] = cb
  }
  return sendToBitwig(JSON.stringify(packet))
}

export function sendPacketToBitwigPromise(packet: { type: string; data: any }): Promise<any> {
  return new Promise(res => sendPacketToBitwig(packet, res))
}

export function sendPacketToBrowser(packet: {
  id?: any
  data?:
    | {}
    | { bitwigConnected: boolean; accessibilityEnabled: any }
    | SerializedActionCallWithModelIdOverrides
  type?: string
}) {
  const str = JSON.stringify(packet)
  if (logInOut) {
    logger.info('Sending to browser:', str)
  }
  activeWebsockets.forEach(info => info.ws.send(str))
}

/**
 * Bitwig->Client interceptors may modify the packet in any way before it reaches the browser, but must
 * return {modified: true} from their handler function. Otherwise changes will not be registered.
 *
 * Returns a function to remove the interceptor
 */
export function interceptPacket(
  type: string,
  toBitwig?: ClientToBitwigInterceptor['handler'],
  fromBitwig?: BitwigToClientInterceptor['handler']
): Function {
  const id = String(nextId++)
  if (toBitwig) {
    toBWInterceptors[type] = (toBWInterceptors[type] || []).concat({
      handler: toBitwig,
      id,
    })
  }
  if (fromBitwig) {
    fromBWInterceptors[type] = (fromBWInterceptors[type] || []).concat({
      handler: fromBitwig,
      id,
    })
  }
  return () => {
    if (toBitwig && toBWInterceptors[type]) {
      toBWInterceptors[type] = toBWInterceptors[type].filter(cept => cept.id !== id)
    }
    if (fromBitwig && fromBWInterceptors[type]) {
      fromBWInterceptors[type] = fromBWInterceptors[type].filter(cept => cept.id !== id)
    }
  }
}

export function addAPIMethod<T>(typePath: string, handler: (packet: any) => Promise<T>) {
  interceptPacket(typePath, async packet => {
    console.log('API method called:', typePath, packet)
    const { data } = packet
    const response = await handler(data)
    sendPacketToBrowser({ id: packet.id, data: response || {} })
  })
}

interceptPacket('api/status', ({ id }) => {
  sendPacketToBrowser({
    type: 'api/status',
    data: {
      bitwigConnected: getService(SocketMiddlemanService).bitwigConnected,
      accessibilityEnabled: Bitwig.isAccessibilityEnabled(false),
    },
    id,
  })
})
