import { idProp, Model, model, prop, tProp, types } from 'mobx-keystone'
import { CueMarker } from 'mods/types'

@model('korus/BitwigCueMarker')
export class BitwigCueMarker extends Model({
  name: prop<string>('').withSetter(),
  id: idProp,
  position: prop<number>(0).withSetter(),
  color: prop<string>('#ffffff').withSetter(),
}) {}

@model('korus/BitwigTrack')
export class BitwigTrack extends Model({
  name: prop<string>('').withSetter(),
  id: idProp,
  color: prop<string>('#ffffff').withSetter(),
  solo: prop<boolean>(false).withSetter(),
  mute: prop<boolean>(false).withSetter(),
  position: prop<number>(0).withSetter(),
  volume: prop<number>(0).withSetter(),
  volumeString: prop<string>('0db').withSetter(),
  type: prop<string>('audio').withSetter(),
}) {}

@model('korus/BitwigState')
export class BitwigState extends Model({
  transportState: prop<'stopped' | 'playing'>('stopped').withSetter(),
  currProject: prop<string>('').withSetter(),
  activeEngineProject: prop<string>('').withSetter(),
  currDevice: prop<string>('').withSetter(),
  currTrack: prop<string>('').withSetter(),
  cueMarkers: prop<CueMarker[]>(() => []).withSetter(),
  browserIsOpen: prop<boolean>(false).withSetter(),
  tracks: prop<BitwigTrack[]>(() => []).withSetter(),
}) {}
