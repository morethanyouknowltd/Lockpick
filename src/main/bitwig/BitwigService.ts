import { Model, model, prop, tProp, types } from 'mobx-keystone'
import { StateService } from 'state/StateService'
import _ from 'underscore'
import { BESService, getService, makeEvent } from '../core/Service'
import { SettingsService } from '../core/SettingsService'
import { interceptPacket } from '../core/WebsocketToSocket'
import { CueMarker } from '../mods/types'
import { PopupService } from '../popup/PopupService'
import { ShortcutsService } from '../shortcuts/ShortcutsService'
import getBitwigModApi from './helpers/getBitwigModApi'

const { Bitwig } = require('bindings')('bes')

@model('korus/BitwigTrack')
class BitwigTrack extends Model({
  name: prop<string>(''),
  color: prop<string>('#ffffff'),
  solo: prop<boolean>(false),
  mute: prop<boolean>(false),
  position: prop<number>(0),
  volume: prop<number>(0),
  volumeString: prop<string>('0db'),
  type: prop<string>(),
}) {}
@model('korus/BitwigState')
class BitwigState extends Model({
  text: prop<string>('asdasd'),
  transportState: prop<'stopped' | 'playing'>('stopped'),
  browserIsOpen: prop<boolean>(),
  tracks: tProp(types.array(types.model(BitwigTrack)), () => []),
}) {}

/**
 * Bitwig Service keeps track of Bitwig internal state, whether the browser is open etc.
 */
export class BitwigService extends BESService {
  // Other services
  settingsService = getService(SettingsService)
  shortcutsService = getService(ShortcutsService)
  popupService = getService(PopupService)

  // Internal state
  browserIsOpen = false
  transportState = 'stopped'
  tracks: any[] = []

  static providedModel = BitwigState

  // Events
  events = {
    transportStateChanged: makeEvent<string>(),
    browserOpen: makeEvent<boolean>(),
    projectChanged: makeEvent<string>(),
    activeEngineProjectChanged: makeEvent<string>(),
    selectedTrackChanged: makeEvent<string>(),
    cueMarkersChanged: makeEvent<CueMarker[]>(),
  }

  currProject = ''
  currDevice = ''
  cueMarkers: CueMarker[] = []
  currTrack?: any
  activeEngineProject = ''

  getApi(args) {
    return getBitwigModApi(args)
  }

  get simplifiedProjectName() {
    if (!this.currProject) {
      return null
    }
    return this.currProject
      .split(/v[0-9]+/)[0]
      .trim()
      .toLowerCase()
  }

  async activate() {
    interceptPacket('browser/state', undefined, ({ data }) => {
      this.log('received browser state packet: ' + data.isOpen)
      const previous = this.browserIsOpen
      this.browserIsOpen = data.isOpen
      this.events.browserOpen.emit(data, previous)
    })
    interceptPacket('transport/state', undefined, ({ data: state }) => {
      this.log('received transport state packet: ' + state)
      const previous = this.transportState
      this.transportState = state
      if (this.transportState !== previous) {
        this.events.transportStateChanged.emit(state, previous)
      }
    })
    interceptPacket('device', undefined, async ({ data: device }) => {
      this.currDevice = device
    })
    interceptPacket('cue-markers', undefined, async ({ data: cueMarkers }) => {
      this.cueMarkers = cueMarkers
      this.events.cueMarkersChanged.emit(this.cueMarkers)
    })
    interceptPacket(
      'project',
      undefined,
      async ({ data: { name: projectName, hasActiveEngine, selectedTrack } }) => {
        const projectChanged = this.currProject !== projectName
        this.updateStore(store => {
          if (projectChanged) {
            store.bitwig.setCurrProject(projectName)
          }
          if (hasActiveEngine) {
            store.bitwig.setActiveEngineProject(projectName)
          }
          if (
            selectedTrack &&
            (!store.bitwig.currTrack || store.bitwig.currTrack !== selectedTrack.name)
          ) {
            store.bitwig.setCurrTrack(selectedTrack.name)
          }
        })
      }
    )
    interceptPacket(
      'tracks',
      undefined,
      (_ as any).debounce(async ({ data: tracks }) => {
        this.updateStore(store => {
          // Start a mobx action
          store.bitwig.setTracks(tracks.map(t => new BitwigTrack(t)))
          // store.bitwig.tracks = tracks
        })
      }, 1000)
    )

    // The following just ensures that pids are populated
    setTimeout(() => {
      Bitwig.isActiveApplication()
    }, 1000 * 2)
  }
}
