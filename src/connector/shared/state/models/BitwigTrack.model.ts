import { Model, model, prop, tProp, types } from 'mobx-keystone'

@model('korus/BitwigTrack')
export class BitwigTrack extends Model({
  name: prop<string>('').withSetter(),
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
  browserIsOpen: prop<boolean>(false).withSetter(),
  tracks: prop<BitwigTrack[]>(() => []).withSetter(),
}) {}
