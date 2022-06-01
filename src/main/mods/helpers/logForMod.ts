import { getService } from 'core/Service'
import { ModsService } from 'mods/ModsService'

export default function logForMod(modId, level, ...args) {
  // const socketLoggingMod = getService(SocketMiddlemanService)
  //   .getActiveWebsockets()
  //   .find(sock => sock.activeModLogKey === modId)

  const modData = getService(ModsService).getLatestModData(modId)
  if (modData?.logger) {
    modData.logger.log(level, args)
  } else {
    console.warn(`${modId} logger not ready, logged: `, ...args)
  }
}
