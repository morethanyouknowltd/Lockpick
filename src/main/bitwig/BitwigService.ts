import { Injectable } from '@nestjs/common'
import { debounce } from 'lodash'
import {
  BitwigCueMarker,
  BitwigState,
  BitwigTrack,
} from '../../connector/shared/state/models/BitwigTrack.model'
import { BESService, makeEvent } from '../core/Service'
import { interceptPacket } from '../core/WebsocketToSocket'
import { CueMarker } from '../mods/types'
import { PopupService } from '../popup/PopupService'
import { SettingsService } from '../settings/SettingsService'
import { ShortcutsService } from '../shortcuts/ShortcutsService'
import getBitwigModApi from './helpers/getBitwigModApi'
const { Bitwig } = require('bindings')('bes')

/**
 * Bitwig Service keeps track of Bitwig internal state, whether the browser is open etc.
 */
@Injectable()
export class BitwigService extends BESService {
  constructor(
    private readonly popupService: PopupService,
    private readonly settingsService: SettingsService,
    private readonly shortcutsService: ShortcutsService
  ) {
    super('BitwigService')
  }

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

  async onModuleInit() {
    interceptPacket('browser/state', undefined, ({ data }) => {
      this.updateStore(store => {
        store.bitwig.setBrowserIsOpen(data.isOpen)
      })
    })
    interceptPacket('transport/state', undefined, ({ data: state }) => {
      this.updateStore(store => {
        store.bitwig.setTransportState(state)
      })
    })
    interceptPacket('device', undefined, async ({ data: device }) => {
      this.updateStore(store => store.bitwig.setCurrDevice(device))
    })
    interceptPacket('cue-markers', undefined, async ({ data }) => {
      this.updateStore(store =>
        store.bitwig.setCueMarkers(data.map(d => new BitwigCueMarker(data)))
      )
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
      debounce(async ({ data: tracks }) => {
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
