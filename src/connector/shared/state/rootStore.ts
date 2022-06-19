import {
  model,
  Model,
  ModelAutoTypeCheckingMode,
  registerRootStore,
  setGlobalConfig,
  tProp,
  types,
} from 'mobx-keystone'
import { Project } from './models/Project.model'
import { BitwigTrack, BitwigState } from './models/BitwigTrack.model'
import { ModsState, Mod, ModSetting, ModAction } from './models/Mod.model'
import { Setting } from './models/Settings.model'
import { Action } from './models/Actions.model'

const modlels = {
  Project,
  BitwigTrack,
  BitwigState,
  Setting,
  Action,
  Mod,
  ModSetting,
  ModAction,
}
// for (const model in modlels) {
//   // Try to stop webpack from removing unused variables
//   console.log(`Here is model`, model, modlels[model])
// }

// for this example we will enable runtime data checking even in production mode
setGlobalConfig({
  modelAutoTypeChecking: ModelAutoTypeCheckingMode.AlwaysOn,
})

@model('korus/RootState')
export class RootState extends Model({
  bitwig: tProp(types.model(BitwigState)),
  mods: tProp(types.model(ModsState)),
}) {}

export function createRootStore(state): RootState {
  // as such, since this allows the model hook `onAttachedToRootStore` to work and other goodies
  console.log(state)
  registerRootStore(state)

  // we can also connect the store to the redux dev tools
  // const remotedev = require('remotedev')
  // const connection = remotedev.connectViaExtension({
  //   name: 'Todo List Example',
  // })

  // connectReduxDevTools(remotedev, connection, rootStore)

  return state
}
