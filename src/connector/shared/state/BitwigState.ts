import { model, Model, prop, Ref, tProp, types } from 'mobx-keystone'
import { Action } from './models/Actions.model'
import { Project } from './models/Project.model'
import { ProjectTrack } from './models/ProjectTrack.model'
import { Setting } from './models/Settings.model'

@model('korus/BitwigState')
export class BitwigState extends Model({
  actions: tProp(types.array(types.model(Action)), () => []),
  projects: tProp(types.array(types.model(Project)), () => []),
  projectTracks: tProp(types.array(types.model(ProjectTrack)), () => []),
  settings: tProp(types.array(types.model(Setting)), () => []),
  activeProject: prop<Ref<Project> | undefined>(),
}) {}
