import _ from 'underscore'
import { BESService, getService, makeEvent } from '../core/Service'
import { SettingsService } from '../core/SettingsService'
import { interceptPacket } from '../core/WebsocketToSocket'
import { CueMarker } from '../mods/ModInfo'
import { PopupService } from '../popup/PopupService'
import { ShortcutsService } from '../shortcuts/ShortcutsService'

const { Bitwig } = require('bindings')('bes')

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
        if (projectChanged) {
          this.currProject = projectName
          this.events.projectChanged.emit(projectName)
          if (hasActiveEngine) {
            this.activeEngineProject = projectName
            this.events.activeEngineProjectChanged.emit(projectName)
          }
        }
        if (selectedTrack && (!this.currTrack || this.currTrack.name !== selectedTrack.name)) {
          const prev = this.currTrack
          this.currTrack = selectedTrack
          this.events.selectedTrackChanged.emit(this.currTrack, prev)
        }
      }
    )
    interceptPacket(
      'tracks',
      undefined,
      (_ as any).debounce(async ({ data: tracks }) => {
        this.tracks = tracks
      }, 1000)
    )

    // The following just ensures that pids are populated
    setTimeout(() => {
      Bitwig.isActiveApplication()
    }, 1000 * 2)
  }
}
