import {
  model,
  Model,
  ModelAutoTypeCheckingMode,
  registerRootStore,
  setGlobalConfig,
  tProp,
  types,
} from 'mobx-keystone'
import { BitwigState } from './BitwigState'
import { Project } from './models/Project.model'
import { ProjectTrack } from './models/ProjectTrack.model'
import { Setting } from './models/Settings.model'
import { Action } from './models/Actions.model'
const modlels = {
  Project,
  ProjectTrack,
  Setting,
  Action,
}
console.log(modlels)

// for this example we will enable runtime data checking even in production mode
setGlobalConfig({
  modelAutoTypeChecking: ModelAutoTypeCheckingMode.AlwaysOn,
})

@model('korus/RootState')
export class RootState extends Model({
  bitwig: tProp(types.model(BitwigState)),
}) {}

export function createRootStore(state): BitwigState {
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
