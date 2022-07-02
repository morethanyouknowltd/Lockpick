import { idProp, Model, model, prop, tProp, types } from 'mobx-keystone'
import { Optional } from '@mtyk/types'

@model('korus/ModSetting')
export class ModSetting extends Model({
  name: prop<string>('').withSetter(),
  id: idProp,
  description: prop<string>('').withSetter(),
  value: prop<any>('').withSetter(),
}) {}

@model('korus/ModAction')
export class ModAction extends Model({
  title: prop<string>('').withSetter(),
  id: prop<string>('').withSetter(),
  description: prop<string>('').withSetter(),
  defaultSetting: prop<any>({}).withSetter(),
  setting: prop<ModSetting>(),
}) {
  action: () => void | Promise<void> = () => {}
}

@model('korus/Mod')
export class Mod extends Model({
  name: prop<string>('').withSetter(),
  id: idProp,
  isUserScript: prop<boolean>(false).withSetter(),
  active: prop<string>('#ffffff').withSetter(),
  applications: prop<string[]>(() => []).withSetter(),
  contents: prop<string>('').withSetter(),
  description: prop<string>('').withSetter(),
  category: prop<string>('').withSetter(),
  error: prop<string>('').withSetter(),
  isBuiltIn: prop<boolean>(false).withSetter(),
  creator: prop<string>('').withSetter(),
  disabled: prop<boolean>(false).withSetter(),
  noReload: prop<boolean>(false).withSetter(),
  settingsKey: prop<string>('').withSetter(),
  path: prop<string>('').withSetter(),
  osMatches: prop<boolean>(false).withSetter(),

  valid: prop<boolean>(false).withSetter(),
  isDefault: prop<boolean>(false).withSetter(),
  actionCategories: prop<any>({}).withSetter(),
  version: prop<string>('').withSetter(),
  actions: prop<ModAction[]>(() => []).withSetter(),
  settings: prop<ModSetting[]>(() => []).withSetter(),
}) {}

@model('korus/ModsState')
export class ModsState extends Model({
  mods: tProp(types.array(types.model(Mod)), () => []).withSetter(),
  selectedModId: prop<string>('').withSetter(),
}) {}
