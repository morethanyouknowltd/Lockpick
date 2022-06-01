export default function logForMod(modId, level, ...args) {
  // const socketLoggingMod = getService(SocketMiddlemanService)
  //   .getActiveWebsockets()
  //   .find(sock => sock.activeModLogKey === modId)

  const modData = this.getLatestModData(modId)
  if (modData?.logger) {
    modData.logger.log(level, args)
  } else {
    console.warn(`${modId} logger not ready, logged: `, ...args)
  }
}
