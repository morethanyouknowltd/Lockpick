import { getService } from 'core/Service'
import {
  sendPacketToBitwig,
  sendPacketToBitwigPromise,
  SocketMiddlemanService,
} from 'core/WebsocketToSocket'
import { normalizeBitwigAction } from 'mods/actionMap'
import { addNotAlreadyIn } from 'mods/helpers/addNotAlreadyIn'
import { ModApiCreator } from 'mods/types'
import { PopupService } from 'popup/PopupService'
import { UIService } from 'ui/UIService'
import { BitwigService } from '../BitwigService'
const { Bitwig, MainWindow } = require('bindings')('bes')

const getBitwigModApi: ModApiCreator = args => {
  const socketService = getService(SocketMiddlemanService)
  const bitwigService = getService(BitwigService)
  const uiService = getService(UIService)
  const popupService = getService(PopupService)

  return addNotAlreadyIn(
    {
      get connected() {
        return socketService.bitwigConnected
      },
      closeFloatingWindows: Bitwig.closeFloatingWindows,
      get isAccessibilityOpen() {
        return Bitwig.isAccessibilityOpen()
      },
      get isPluginWindowActive() {
        return Bitwig.isPluginWindowActive()
      },
      get tracks() {
        return bitwigService.tracks
      },
      get isBrowserOpen() {
        return bitwigService.browserIsOpen
      },
      isActiveApplication(...args: any[]) {
        return Bitwig.isActiveApplication(...args)
      },
      MainWindow,
      get currentTrack() {
        return bitwigService.currTrack
      },
      get currentDevice() {
        return bitwigService.currDevice
      },
      get cueMarkers() {
        return bitwigService.cueMarkers
      },
      get currentProject() {
        return bitwigService.simplifiedProjectName
      },
      sendPacket: (packet: any) => {
        return sendPacketToBitwig(packet)
      },
      sendPacketPromise: (packet: any) => {
        return sendPacketToBitwigPromise(packet)
      },
      runAction: (action: any) => {
        let actions = action
        if (!Array.isArray(actions)) {
          actions = [action]
        }
        return sendPacketToBitwigPromise({
          type: 'action',
          data: actions.map(normalizeBitwigAction),
        })
      },
      getFocusedPluginWindow: () => {
        const pluginWindows = Bitwig.getPluginWindowsPosition()
        return Object.values(pluginWindows).find((w: any) => w.focused)
      },
      showMessage: popupService.showMessage,
      intersectsPluginWindows: (event: any) => uiService.eventIntersectsPluginWindows(event),
      ...args.makeEmitterEvents({
        ...bitwigService.events,
      }),
    },
    Bitwig
  )
}

export default getBitwigModApi
