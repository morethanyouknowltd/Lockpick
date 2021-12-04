declare const host: any
declare const loadAPI: any
declare const println: any
declare const load: any
declare const Object2: any
declare const loadMods: any

loadAPI(12)
load('es5-shim.min.js')
load('json3.min.js')
load('Object2.js')
const debug = process.env.DEBUG === 'true'
const debugAsync = process.env.DEBUG_ASYNC === 'true'

class EventEmitter<T> {
  nextId = 0
  listenersById: { [id: number]: (...values: [T, ...any[]]) => void } = {}
  listen(cb: (data: T) => void) {
    let nowId = this.nextId++
    this.listenersById[nowId] = cb
    return nowId
  }
  stopListening(id: number) {
    delete this.listenersById[id]
  }
  emit(...values: [T, ...any[]]) {
    for (const listener of Object.values(this.listenersById)) {
      // logWithTime('Emitting to listener' + listener.toString())
      listener(...values)
    }
  }
}

function makeEvent<T>(): EventEmitter<T> {
  return new EventEmitter()
}

const toUTF8Array = str => {
  var utf8 = []
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i)
    if (charcode < 0x80) utf8.push(charcode)
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f))
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f))
    }
    // surrogate pair
    else {
      i++
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      )
    }
  }
  return utf8
}

const log = (msg: string) => {
  if (debug) {
    const d = new Date()
    const pad0 = input => ('0' + input).substr(-2)
    println(`${d.getHours()}:${pad0(d.getMinutes())}:${pad0(d.getSeconds())}:` + msg)
  }
}

const FX_TRACK_BANK_SIZE = 16
const MAIN_TRACK_BANK_SIZE = 128
const CUE_MARKER_BANK_SIZE = 32
const DEVICE_BANK_SIZE = 16
const LAYER_BANK_SIZE = 16

host.setShouldFailOnDeprecatedUse(false)
host.defineController(
  'Lockpick',
  'Lockpick',
  '0.1',
  'b90a4894-b89c-40b9-b372-e1e8659699df',
  'More Than You Know'
)

let app: any
let connection: any
let settings = {
  exclusiveArm: true,
}

type Packet = {
  type: string
} & any

class PacketError {
  constructor(public readonly code: number, public readonly message?: string) {}
}

function setTimeout2(fn, wait, name = 'Unnamed'): any {
  host.scheduleTask(() => {
    if (debugAsync) {
      log(`Running scheduled task: ${name}`)
    }
    fn()
  }, wait)
}

function debounce(fn, wait = 1) {
  let id = 0
  return function (...args) {
    let waitingId = ++id
    setTimeout2(() => {
      if (id === waitingId) {
        fn(...args)
      }
    }, wait)
  }
}

function runAction(actionNames: string | string[]) {
  if (typeof actionNames === 'string') {
    actionNames = [actionNames]
  }
  for (const actionName of actionNames) {
    const action = app.getAction(actionName)
    if (action) {
      log(`Running action: ` + actionName)
      action.invoke()
    } else {
      host.showPopupNotification(`Action ${actionName} not found`)
    }
  }
}

class PacketManager {
  connection: any
  activeConnection: any
  listenersByType: { [type: string]: ((packet: Packet) => void)[] } = {}
  events = {
    connected: makeEvent<void>(),
    disconnected: makeEvent<void>(),
  }
  queued = []
  constructor(deps: Deps) {
    const { app, globalController, showMessage } = deps
    this.connection = connection
    log('Created remote connection on port: ' + this.connection.getPort())
    this.connection.setClientConnectCallback(connection => {
      log('Connected to Node')
      this.activeConnection = connection
      setTimeout2(() => {
        // A little delay to allow initial events to come through once all listeners are set up
        // on either end. Really need a better way of handling this, but it works for now
        this.events.connected.emit()
        // for (const packet of this.queued) {
        //     try {
        //         this.send(packet)
        //     } catch (e) {
        //         println('error sending queued packet')
        //     }
        // }
        // this.queued = []
      }, 500)
      this.activeConnection.setDisconnectCallback(() => {
        this.events.disconnected.emit()
        host.showPopupNotification('Lockpick disconnected')
        this.activeConnection = null
      })
      this.activeConnection.setReceiveCallback(data => {
        try {
          const str = bytesToString(data)
          // log('string is ' + str)
          const packet = JSON.parse(str)
          // log('parsed the packet')
          const listeners = this.listenersByType[packet.type] || []
          let warnNoListeners = listeners.length === 0
          if (packet.type === 'ping') {
            return this.send({ type: 'pong' })
          }
          if (packet.type === 'action') {
            warnNoListeners = false
            const actions = typeof packet.data === 'object' ? packet.data : [packet.data]
            for (const actionName of actions) {
              runAction(actionName)
            }
          }
          log(`Received packet of type: ${packet.type}`)
          // log('send response???')
          let noAutoRespond = packet.oneWay || false
          let errors = []
          if (warnNoListeners) {
            host.showPopupNotification('No listeners attached for packet type: ' + packet.type)
          }
          for (const listener of listeners) {
            try {
              const response = listener(packet) as any
              if (response) {
                log('sending response as: ' + JSON.stringify(response))
                this.send({
                  type: packet.type,
                  id: packet.id,
                  ...response,
                })
              } else if (response === false) {
                noAutoRespond = true
              }
            } catch (e) {
              errors.push(e)
              log(e)
            }
          }
          if (!noAutoRespond) {
            // Send back the packet with additional info so we have a way
            // of tracking when things have been processed
            this.send({
              id: packet.id,
              data: packet.data,
              type: packet.type,
              status: errors.length ? 500 : 200,
              errors,
            })
          }
        } catch (e) {
          log(e)
          showMessage(e)
        }
      })
    })
  }
  listen(type: string, cb: (p: Packet) => void) {
    log(`Added packet listener for type: ${type}`)
    this.listenersByType[type] = this.listenersByType[type] || [].concat(cb)
  }
  replyWithData(packet: Packet, data: any) {
    this.send({
      type: packet.type,
      id: packet.id,
      data,
    })
  }
  send(packet: Packet) {
    if (this.activeConnection) {
      const asString = JSON.stringify(packet)
      this.activeConnection.send(toUTF8Array((asString.length + asString) as any))
    } else {
      this.queued.push(packet)
    }
  }
}

type Deps = {
  packetManager: PacketManager
  globalController: GlobalController
  app: any
  arranger: any
  transport: any
  deviceController: DeviceController
  browserController: BrowserController
  showMessage: Function
}

class Controller {
  static controllers: { [name: string]: Controller } = {}
  static get(classs: any): any {
    return Controller.controllers[classs.name]
  }
  constructor(public readonly deps: Deps) {
    Controller.controllers[this.constructor.name] = this
  }
}

class GlobalController extends Controller {
  trackBank = host.createMainTrackBank(MAIN_TRACK_BANK_SIZE, 0, 0)
  fxBank = host.createEffectTrackBank(FX_TRACK_BANK_SIZE, 0)
  cursorTrack = host.createCursorTrack('selectedTrack', 'selectedTrack', 0, 0, true)
  // cursorSiblingsTrackBank = this.cursorTrack.createcreateSiblingsTrackBank(16, 0, 0, true, false)
  cueMarkerBank: any
  lastSelectedTrack: string = ''
  masterTrack = host.createMasterTrack(0)
  nameCache: { [trackName: string]: any } = {}

  /**
   * Will get called whenever the name of the current track changes (most reliable way I know of)
   */
  selectedTrackChanged = new EventEmitter<string>()

  constructor(public readonly deps: Deps) {
    super(deps)

    const { packetManager } = deps
    packetManager.listen('track/update', ({ data: { name, volume, solo, mute } }) => {
      const track = this.findTrackByName(name)
      if (!track) {
        throw new PacketError(404, 'Track not found')
      }
      if (volume !== undefined) {
        track.volume().set(volume)
      }
      if (solo !== undefined) {
        track.solo().set(solo)
      }
      if (mute !== undefined) {
        track.mute().set(mute)
      }
    })
    packetManager.listen('track/get', ({ data: { name } }) => {
      const track = this.findTrackByName(name)
      if (!track) {
        throw new PacketError(404, 'Track not found')
      }
      return {
        type: 'track/get',
        data: this.createTrackInfo(track),
      }
    })
    packetManager.listen('track/select', ({ data: { name, allowExitGroup, enter, scroll } }) => {
      this.selectTrackWithName(name, scroll !== undefined ? true : scroll, allowExitGroup, enter)
    })
    packetManager.listen('track/selected/scroll', () => {
      this.cursorTrack.makeVisibleInArranger()
    })
    this.deps.app.projectName().markInterested()
    this.deps.app.hasActiveEngine().markInterested()

    packetManager.listen('application/undo', () => this.deps.app.undo())
    packetManager.listen('application/redo', () => this.deps.app.redo())

    packetManager.events.connected.listen(() => {
      this.sendAllTracksAndProject()
      this.sendAllCueMarkers()
    })

    this.cursorTrack.name().markInterested()
    this.cursorTrack.name().addValueObserver(value => {
      this.lastSelectedTrack = value
      this.selectedTrackChanged.emit(value)
    })

    this.mapTracks((t, i, isFX) => {
      t.name().markInterested()
      t.solo().markInterested()
      t.arm().markInterested()
      t.mute().markInterested()
      t.color().markInterested()
      t.position().markInterested()
      t.trackType().markInterested()
      t.volume().markInterested()
      t.volume().displayedValue().markInterested()

      // send all tracks when track name changes
      // hopefully this runs when new tracks are added
      t.name().addValueObserver(name => {
        this.nameCache = {}
        if (Controller.get(TrackSearchController).active) {
          // Don't send track changes whilst highlighting search results
          return
        }
        // Clear the name cache, could now be wrong
        this.sendAllTracksAndProject()
      })

      t.addIsSelectedInEditorObserver(selected => {
        if (selected) {
          // this is basically the hook for when selected track changes

          if (t.trackType().get() !== 'Group') {
            // Group tracks bug out when you make them visible,
            // vertically centering on their child content and not
            // actually showing the group
            // t.makeVisibleInArranger()
          }
          this.sendProject({ track: t.name().get() })
        }
      })
    })

    this.cueMarkerBank = this.deps.arranger.createCueMarkerBank(CUE_MARKER_BANK_SIZE)
    this.mapCueMarkers(marker => {
      marker.getName().markInterested()
      marker.getColor().markInterested()
      marker.position().markInterested()
      marker.position().addValueObserver(pos => {
        this.sendAllCueMarkers()
      })
      marker.getColor().addValueObserver(color => {
        this.sendAllCueMarkers()
      })
      marker.getName().addValueObserver(name => {
        this.sendAllCueMarkers()
      })
    })

    this.deps.app.projectName().addValueObserver(name => {
      this.sendProject()
    })

    // deps.transport.getPosition().addValueObserver(position => {
    //     this.deps.packetManager.send({
    //         type: 'transport',
    //         data: {
    //             position
    //         }
    //     })
    // })
  }

  mapCueMarkers<T>(cb: (cueMarker, i: number) => T, filterNull = false) {
    let out = []
    const processC = (cm, i) => {
      const result = cb(cm, i)
      if (!filterNull || result != null) {
        out.push(result)
      }
    }
    for (let i = 0; i < CUE_MARKER_BANK_SIZE; i++) {
      processC(this.cueMarkerBank.getItemAt(i), i)
    }
    return out
  }

  mapTracks<T>(cb: (track, i: number, isFX: boolean) => T, filterNull = false) {
    let out = []
    const processT = (track, i, isFX = false) => {
      const result = cb(track, i, isFX)
      if (!filterNull || result != null) {
        out.push(result)
      }
    }
    for (let i = 0; i < MAIN_TRACK_BANK_SIZE; i++) {
      processT(this.trackBank.getItemAt(i), i)
    }
    for (let i = 0; i < FX_TRACK_BANK_SIZE; i++) {
      processT(this.fxBank.getItemAt(i), i + MAIN_TRACK_BANK_SIZE, true)
    }
    processT(this.masterTrack, MAIN_TRACK_BANK_SIZE + FX_TRACK_BANK_SIZE, false)
    return out
  }

  createTrackInfo(t, isFX: boolean = false) {
    const name = t.name().get()
    return {
      name,
      color: convertBWColorToHex(t.color()),
      solo: t.solo().get(),
      mute: t.mute().get(),
      position:
        t === this.masterTrack ? -1 : t.position().get() + (isFX ? MAIN_TRACK_BANK_SIZE : 0),
      volume: t.volume().get(),
      volumeString: t.volume().displayedValue().get(),
      type: t.trackType().get(),
    }
  }

  createCueMarkerInfo(cueMarker) {
    return {
      name: cueMarker.getName().get(),
      position: cueMarker.position().get(),
      color: convertBWColorToHex(cueMarker.getColor()),
    }
  }

  sendProject({ track }: { track?: string } = {}) {
    const trackObj = this.findTrackByName(track || this.cursorTrack.name().get())
    this.deps.packetManager.send({
      type: 'project',
      data: {
        name: this.deps.app.projectName().get(),
        hasActiveEngine: this.deps.app.hasActiveEngine().get(),
        selectedTrack: trackObj ? this.createTrackInfo(trackObj, false) : null,
      },
    })
    this.sendAllCueMarkers()
  }

  sendAllTracksAndProject() {
    const tracks = this.mapTracks((t, i, isFX) => {
      const name = t.name().get()
      if (name.length === 0) return null
      return this.createTrackInfo(t)
    }, true)
    this.sendProject()
    this.deps.packetManager.send({
      type: 'tracks',
      data: tracks,
    })
  }

  sendAllCueMarkers() {
    const cueMarkers = this.mapCueMarkers((cm, i) => {
      const name = cm.getName().get()
      if (name.length === 0) return null
      return this.createCueMarkerInfo(cm)
    }, true)
    this.deps.packetManager.send({
      type: 'cue-markers',
      data: cueMarkers,
    })
  }

  addTrackToCache(name) {
    for (let i = 0; i < MAIN_TRACK_BANK_SIZE; i++) {
      const t = this.trackBank.getItemAt(i)
      if (t.name().get() == name) {
        this.nameCache[name] = t
        return
      }
    }
    for (let i = 0; i < FX_TRACK_BANK_SIZE; i++) {
      const t = this.fxBank.getItemAt(i)
      if (t.name().get() == name) {
        this.nameCache[name] = t
        return
      }
    }
  }

  findTrackByName(name) {
    if (name === 'Master') {
      return this.masterTrack
    }
    if (!this.nameCache[name]) {
      this.addTrackToCache(name)
    }
    return this.nameCache[name]
  }

  selectTrackWithName(name, scroll = true, allowExitGroup = false, enter = false) {
    const t = this.findTrackByName(name)
    if (!t) {
      if (allowExitGroup) {
        runAction('focus_track_header_area')
        runAction('Exit Group')
        setTimeout2(() => {
          this.selectTrackWithName(name, scroll, false, enter)
        }, 1000)
      }
    } else {
      t.selectInMixer()
      if (scroll) {
        t.makeVisibleInArranger()
      }
      if (enter) {
        setTimeout2(() => {
          runAction('focus_track_header_area')
          runAction('Enter Group')
          runAction('select_track1')
        }, 100)
      }
    }
  }
}

class TrackSearchController extends Controller {
  trackSelectedWhenStarted: string = ''
  active = false
  constructor(deps) {
    super(deps)
    const { packetManager, globalController } = deps
    packetManager.listen('tracksearch/start', () => {
      this.trackSelectedWhenStarted = globalController.lastSelectedTrack
      this.active = true
      globalController.sendAllTracks()
      globalController.sendAllCueMarkers()
    })
    packetManager.listen('tracksearch/cancel', () => {
      if (this.trackSelectedWhenStarted.length > 0) {
        globalController.selectTrackWithName(this.trackSelectedWhenStarted)
      }
      this.active = false
    })
    packetManager.listen('tracksearch/highlighted', ({ data: trackName }) => {
      globalController.selectTrackWithName(trackName)
    })
    packetManager.listen('tracksearch/confirm', ({ data: trackName }) => {
      this.active = false
      globalController.selectTrackWithName(trackName)
    })
  }
}

class BugFixController extends Controller {
  trackSelectedWhenStarted: string = ''
  active = false
  constructor(deps) {
    super(deps)
    const wait = 40
    const { packetManager, globalController } = deps
    packetManager.listen('bugfix/buzzing', () => {
      globalController.mapTracks((track, i) => {
        setTimeout2(() => {
          track.solo().set(true)
        }, wait * i)
        setTimeout2(() => {
          track.solo().set(false)
        }, wait * i + wait)
      })
    })
  }
}

class DeviceController extends Controller {
  trackSelectedWhenStarted: string = ''
  active = false
  cursorDevice
  deviceChain
  deviceBank
  cursorTrack
  cursorLayer
  layerBank
  drumPadBank
  cursorSlotDeviceBank
  cursorLayerDeviceBank
  cursorTrackDeviceBank

  mapDevices(cb) {
    for (let i = 0; i < DEVICE_BANK_SIZE; i++) {
      const device = this.deviceBank.getDevice(i)
      if (device.exists().get()) {
        cb(device, i)
      }
    }
  }

  reverseSlots = ['Polysynth', 'Phase-4', 'Reverb', 'FM-4', 'Sampler']
  deviceSlotMaps = {
    'Multiband FX-3': {
      1: 2,
      2: 1,
    },
    'Delay-4': {
      3: 2,
      2: 3,
    },
  }

  constructor(deps) {
    super(deps)

    for (const device of this.reverseSlots) {
      this.deviceSlotMaps[device] = {
        0: 1,
        1: 0,
      }
    }

    const { packetManager, globalController } = deps

    this.cursorTrack = host.createCursorTrack('Selected Track', 'Selected Track', 0, 0, true)

    this.cursorDevice = this.cursorTrack.createCursorDevice()
    this.deviceChain = this.cursorDevice.deviceChain()
    this.deviceBank = this.deviceChain.createDeviceBank(DEVICE_BANK_SIZE)
    this.cursorTrackDeviceBank = this.cursorTrack.createDeviceBank(1)

    this.cursorDevice.isExpanded().markInterested()
    this.cursorDevice.isRemoteControlsSectionVisible().markInterested()
    this.cursorDevice.exists().markInterested()
    this.cursorDevice.slotNames().markInterested()
    this.cursorDevice.name().markInterested()
    this.cursorDevice.hasDrumPads().markInterested()
    this.cursorDevice.hasLayers().markInterested()
    this.cursorDevice.hasSlots().markInterested()

    this.cursorLayer = this.cursorDevice.createCursorLayer()

    this.cursorDevice.getCursorSlot().name().markInterested()
    this.cursorSlotDeviceBank = this.cursorDevice.getCursorSlot().createDeviceBank(1)
    this.cursorSlotDeviceBank.getDevice(0).exists().markInterested()

    this.cursorLayerDeviceBank = this.cursorLayer.createDeviceBank(1)
    this.cursorLayerDeviceBank.getDevice(0).exists().markInterested()

    this.layerBank = this.cursorDevice.createLayerBank(LAYER_BANK_SIZE)
    this.drumPadBank = this.cursorDevice.createDrumPadBank(LAYER_BANK_SIZE)
    let selectedLayer = 0
    let selectedDrumPad = 0

    this.layerBank.channelCount().markInterested()
    this.drumPadBank.channelCount().markInterested()

    this.cursorDevice.name().addValueObserver(() => {
      packetManager.send({
        type: 'device',
        data: {
          name: this.cursorDevice.name().get(),
        },
      })
    })

    for (let i = 0; i < LAYER_BANK_SIZE; i++) {
      const layer = this.layerBank.getChannel(i)
      layer.addIsSelectedInEditorObserver(selected => {
        if (selected) {
          selectedLayer = i
        }
      })
      const drumPad = this.layerBank.getChannel(i)
      drumPad.addIsSelectedInEditorObserver(selected => {
        if (selected) {
          selectedDrumPad = i
        }
      })
    }

    const ensureDeviceSelected = () => {
      if (this.cursorDevice.name().get().trim() === '') {
        this.cursorTrackDeviceBank.getDevice(0).selectInEditor()
      }
    }

    for (let i = 0; i < DEVICE_BANK_SIZE; i++) {
      const device = this.deviceBank.getDevice(i)
      device.isExpanded().markInterested()
      device.isRemoteControlsSectionVisible().markInterested()
      device.exists().markInterested()
    }

    packetManager.listen('devices/chain/collapse', () => {
      this.mapDevices(device => {
        device.isExpanded().set(false)
        device.isRemoteControlsSectionVisible().set(false)
      })
    })

    packetManager.listen('devices/chain/expand', () => {
      this.mapDevices(device => {
        device.isExpanded().set(true)
      })
    })

    packetManager.listen('devices/selected/collapse', () => {
      this.cursorDevice.isExpanded().set(false)
      this.cursorDevice.isRemoteControlsSectionVisible().set(false)
    })

    packetManager.listen('devices/selected/expand', () => {
      this.cursorDevice.isExpanded().set(true)
    })

    packetManager.listen('devices/selected/layers/select', ({ data: i }) => {
      ensureDeviceSelected()

      const recurseUp = (levelsUp = 0) => {
        if (levelsUp > 5) {
          return
        }

        const device = this.cursorDevice
        const hasLayers = device.hasLayers().get()
        const hasDrumPads = device.hasDrumPads().get()

        const withDrumPadsOrLayers = input => {
          const alreadySelected = i == (hasLayers ? selectedLayer : selectedDrumPad)
          if (alreadySelected) {
            const firstDevice = this.cursorLayerDeviceBank.getDevice(0)
            if (firstDevice.exists().get()) {
              this.cursorLayerDeviceBank.getDevice(0).selectInEditor()
            } else {
              input.getChannel(i).browseToInsertAtEndOfChain()
            }
          } else {
            if (i > input.channelCount().get() - 1) {
              // TODO How do we insert a new layer here?
              input.getChannel(i).startOfDeviceChainInsertionPoint().browse()
            } else {
              input.getChannel(i).selectInEditor()
            }
          }
          setTimeout2(() => {
            this.cursorLayerDeviceBank.getDevice(0).selectInEditor()
          }, 0)
        }
        if (hasLayers) {
          withDrumPadsOrLayers(this.layerBank)
        } else if (hasDrumPads) {
          withDrumPadsOrLayers(this.drumPadBank)
        } else {
          device.selectParent()
          setTimeout2(() => {
            recurseUp(levelsUp + 1)
          }, 100)
        }
      }
      recurseUp()
    })

    packetManager.listen('devices/selected/slot/select', ({ data: i }) => {
      ensureDeviceSelected()
      const recurseUp = (levelsUp = 0) => {
        if (levelsUp > 5) {
          return
        }

        const deviceName = this.cursorDevice.name().get()
        if (deviceName in this.deviceSlotMaps) {
          i = this.deviceSlotMaps[deviceName][i] ?? i
        }

        const slotNames = this.cursorDevice.slotNames().get()
        const slotName = slotNames[i]
        if (this.cursorDevice.hasSlots().get()) {
          const currentlySelected = this.cursorDevice.getCursorSlot().name().get()
          if (currentlySelected === slotName) {
            const firstDevice = this.cursorSlotDeviceBank.getDevice(0)
            if (firstDevice.exists().get()) {
              this.cursorSlotDeviceBank.getDevice(0).selectInEditor()
            } else {
              this.cursorDevice.getCursorSlot().browseToInsertAtEndOfChain()
            }
          } else {
            this.cursorDevice.getCursorSlot().selectSlot(slotName)
          }
        } else {
          this.cursorDevice.selectParent()
          setTimeout2(() => {
            recurseUp(levelsUp + 1)
          }, 100)
        }
      }
      recurseUp()
    })

    packetManager.listen('devices/selected/chain/insert-at-end', () => {
      ensureDeviceSelected()
      this.cursorDevice.deviceChain().browseToInsertAtEndOfChain()
    })
    packetManager.listen('devices/selected/chain/insert-at-start', () => {
      ensureDeviceSelected()
      this.cursorDevice.deviceChain().browseToInsertAtStartOfChain()
    })

    packetManager.listen('devices/selected/navigate-up', () => {
      this.cursorDevice.selectParent()
    })

    packetManager.listen('devices/selected/layer/insert-at-end', () => {
      this.cursorLayer.browseToInsertAtEndOfChain()
    })

    packetManager.listen('devices/selected/layer/select-first', () => {
      this.cursorLayerDeviceBank.getDevice(0).selectInEditor()
    })

    packetManager.listen('tracks/selected/devices/select-first', () => {
      this.cursorTrackDeviceBank.getDevice(0).selectInEditor()
    })
  }
}

class BrowserController extends Controller {
  popupBrowser: any
  isOpen = false
  columnData = []
  constructor(deps) {
    super(deps)
    const { packetManager, globalController } = deps
    this.popupBrowser = host.createPopupBrowser()
    const pb = this.popupBrowser
    const isOpenCb =
      cb =>
      (...args) => {
        if (this.isOpen) cb(...args)
      }
    const clearFilters = () => {
      for (const col of this.columnData) {
        col.reset()
      }
    }
    pb.title().markInterested()
    pb.exists().markInterested()
    pb.exists().addValueObserver(exists => {
      const title = pb.title().get() || ''
      log('Browser open (' + title + ') exists:' + exists)
      this.isOpen = exists

      packetManager.send({
        type: 'browser/state',
        data: {
          isOpen: exists,
          title,
        },
      })
    })
    pb.selectedContentTypeIndex().markInterested()
    const filterColumns = [
      pb.smartCollectionColumn(),
      pb.locationColumn(),
      pb.deviceColumn(),
      pb.categoryColumn(),
      pb.tagColumn(),
      pb.deviceTypeColumn(),
      pb.fileTypeColumn(),
      pb.creatorColumn(),
      // pb.resultsColumn()
    ]
    const resultsItemBank = pb.resultsColumn().createItemBank(1)
    const resultsCursorItem = pb.resultsColumn().createCursorItem()
    resultsCursorItem.isSelected().markInterested()
    const selectIfNone = () => {
      if (!resultsCursorItem.isSelected().get()) {
        this.popupBrowser.selectNextFile()
      }
    }

    this.columnData = filterColumns.map(col => {
      const wildCard = col.getWildcardItem()
      wildCard.isSelected().markInterested()
      return {
        wildCard,
        reset: () => wildCard.isSelected().set(true),
      }
    })

    packetManager.listen(
      'browser/confirm',
      isOpenCb(() => this.popupBrowser.commit())
    )
    packetManager.listen(
      'browser/select-and-confirm',
      isOpenCb(() => {
        selectIfNone()
        this.popupBrowser.commit()
      })
    )
    packetManager.listen(
      'browser/filters/clear',
      isOpenCb(() => {
        clearFilters()
        runAction('focus_browser_search_field')
      })
    )
    packetManager.listen(
      'browser/tabs/next',
      isOpenCb(() => {
        pb.selectedContentTypeIndex().inc(1)
        clearFilters()
        selectIfNone()
        runAction('focus_browser_search_field')
      })
    )
    packetManager.listen(
      'browser/tabs/set',
      isOpenCb(({ data }) => {
        pb.selectedContentTypeIndex().set(data)
        clearFilters()
        selectIfNone()
        runAction('focus_browser_search_field')
      })
    )
    packetManager.listen(
      'browser/tabs/previous',
      isOpenCb(() => {
        pb.selectedContentTypeIndex().inc(-1)
        clearFilters()
        selectIfNone()
        runAction('focus_browser_search_field')
      })
    )
  }
}

class UIController extends Controller {
  hasDoubleRowTrackHeight
  constructor(deps) {
    super(deps)
    const { packetManager, globalController, arranger } = deps
    arranger.hasDoubleRowTrackHeight().markInterested()
    arranger.hasDoubleRowTrackHeight().addValueObserver(yes => {
      this.hasDoubleRowTrackHeight = yes
      this.sendUIUpdate()
    })
    this.hasDoubleRowTrackHeight = arranger.hasDoubleRowTrackHeight().get()
    packetManager.events.connected.listen(() => {
      this.sendUIUpdate()
    })
    this.sendUIUpdate()
  }
  sendUIUpdate() {
    this.deps.packetManager.send({
      type: 'ui',
      data: {
        isLargeTrackHeight: this.hasDoubleRowTrackHeight,
      },
    })
  }
}

class SettingsController extends Controller {
  constructor(deps) {
    super(deps)
    const { packetManager, globalController } = deps
    packetManager.listen('settings/update', ({ data }) => {
      for (const key in data) {
        settings[key] = data[key]
      }
    })
  }
}

class BackForwardController extends Controller {
  trackHistory: { name: string }[] = []
  historyIndex = -1
  ignoreSelectionChangesOnce = false

  constructor(deps: Deps) {
    super(deps)
    const { packetManager, globalController } = deps
    globalController.selectedTrackChanged.listen(this.onSelectedTrackChanged)
    packetManager.listen('tracknavigation/back', () => {
      if (this.historyIndex > 0) {
        this.ignoreSelectionChangesOnce = true
        this.historyIndex--
        const name = this.trackHistory[this.historyIndex].name
        globalController.selectTrackWithName(name)
        deps.showMessage(name)
      }
    })
    packetManager.listen('tracknavigation/forward', () => {
      if (this.historyIndex < this.trackHistory.length - 1) {
        this.ignoreSelectionChangesOnce = true
        this.historyIndex++
        const name = this.trackHistory[this.historyIndex].name
        globalController.selectTrackWithName(name)
        deps.showMessage(name)
      }
    })
  }

  onSelectedTrackChanged = (name: string) => {
    if (Controller.get(TrackSearchController).active) {
      // Don't record track changes whilst highlighting search results
      return
    }
    if (name.trim().length == 0 || this.ignoreSelectionChangesOnce) {
      this.ignoreSelectionChangesOnce = false
      return
    }
    while (this.trackHistory.length > 50) {
      this.trackHistory.splice(0, 1)
      this.historyIndex--
    }
    this.trackHistory = this.trackHistory.slice(0, this.historyIndex + 1)
    // log('track name changed to ' + value)
    this.trackHistory.push({ name })
    this.historyIndex++
  }
}

function bytesToString(data) {
  var clientData = ''
  for (var i = 0; i < data.length; i++) {
    clientData += String.fromCharCode(data[i])
  }
  return clientData
}

function convertBWColorToHex(color) {
  const red = color.red()
  const green = color.green()
  const blue = color.blue()
  let pad0 = input => (input.length === 1 ? `0${input}` : input)
  const componentToHex = c =>
    pad0(
      Math.round(c * 255)
        .toString(16)
        .substr(0, 2)
        .toUpperCase()
    )
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`
}

let waitingOnFlush = []
function flush() {
  for (const cb of waitingOnFlush) {
    cb()
  }
  waitingOnFlush = []
}

function onFlush(cb) {
  waitingOnFlush.push(cb)
  host.requestFlush()
}

function init() {
  // var app = host.createApplication()
  const transport = host.createTransport()
  app = host.createApplication()
  const arranger = host.createArranger()

  connection = host.createRemoteConnection('name', 8888)
  log('Created the host')

  // fix for bug that doesn't reset automation at specific point
  transport.getPosition().markInterested()
  transport.playStartPosition().markInterested()

  let isPlaying = false
  // transport.isPlaying().addValueObserver(yesOrNo => {
  //     if (yesOrNo) {
  //         isPlaying = true
  //     } else if (isPlaying) {
  //         isPlaying = false
  //         transport.getPosition().set(transport.playStartPosition().get())
  //     }
  // })

  let deps: Deps = {
    app,
    arranger,
    transport,
    showMessage: msg => {
      deps.packetManager.send({
        type: 'message',
        data: { msg },
      })
    },
    showNotification: notif => {
      deps.packetManager.send({
        type: 'notification',
        data: notif,
      })
    },
  } as any
  deps.packetManager = new PacketManager(deps)
  deps.globalController = new GlobalController(deps)
  transport.playStartPosition().addValueObserver(position => {
    deps.packetManager.send({
      type: 'transport/play-start',
      position,
    })
  })
  transport.isPlaying().markInterested()
  transport.isPlaying().addValueObserver(playing => {
    deps.packetManager.send({
      type: 'transport/state',
      data: playing ? 'playing' : 'stopped',
    })
  })

  new TrackSearchController(deps)
  new BackForwardController(deps)
  new UIController(deps)
  deps.browserController = new BrowserController(deps)
  new BugFixController(deps)
  deps.deviceController = new DeviceController(deps)
  new SettingsController(deps)

  deps.packetManager.listen('transport/play', () => transport.togglePlay())
  deps.packetManager.listen('transport/stop', () => transport.stop())
  deps.packetManager.listen('message', ({ data: message }) => {
    log(message)
    host.showPopupNotification(message)
  })
  deps.packetManager.listen('actions', () => {
    const actions = app.getActions()
    let out = []
    for (const action of actions) {
      out.push(action)
    }
    return {
      type: 'actions',
      data: out.map(action => {
        return {
          id: action.getId(),
          name: action.getName(),
          description: action.getMenuItemText(),
          category: action.getCategory().getName(),
        }
      }),
    }
  })

  load('mods.js')
  const getApiMaker = () => {
    const freezeFunctions = obj => {
      for (const key in obj) {
        const d = obj[key]
        if (typeof d === 'function') {
          delete obj[key]
          obj[`__function${key}`] = d.toString()
        }
      }
      return obj
    }
    return mod => {
      const api = {
        tracks: {
          forEach: cb => {
            deps.globalController.mapTracks(cb)
          },
          map: cb => {
            return deps.globalController.mapTracks(cb)
          },
        },
        cursorTrack: deps.globalController.cursorTrack,
        // cursorSiblingsTrackBank: deps.globalController.cursorSiblingsTrackBank,
        settings,
        runAction,
        log: (msg: string, modId?: string) => {
          if (debug) {
            deps.packetManager.send({
              type: 'bitwig/log',
              data: {
                msg,
                modId,
              },
            })
            println(msg)
          }
        },
        findTrackByName: deps.globalController.findTrackByName.bind(deps.globalController),
        transport,
        ...deps,
        setTimeout: setTimeout2,
        afterUpdates: fn => setTimeout2(fn, 25),
        onFlush,
        debounce,
        remoteApiCall: (path, ...args) => {
          // host.showPopupNotification(path)
          deps.packetManager.send({
            type: 'apiCall',
            data: {
              path,
              modId: mod.id,
              args: args.map(freezeFunctions),
            },
          })
        },
        Mod: {
          registerAction: action => {
            const actionId = `${action.id}`
            deps.packetManager.listen(actionId, () => {
              action.action()
            })
            const remoteAction = {
              ...action,
              __functionaction: `() => {
                                Bitwig.sendPacket({
                                    type: "${actionId}"
                                })
                            }`,
            }
            delete remoteAction.action
            api.remoteApiCall('Mod.registerAction', remoteAction)
            deps.packetManager.events.connected.listen(() => {
              api.remoteApiCall('Mod.registerAction', remoteAction)
            })
          },
        },
      }
      return api
    }
  }
  loadMods(getApiMaker())
}
