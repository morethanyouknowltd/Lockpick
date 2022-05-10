import { detach, idProp, model, Model, prop, rootRef, tProp, types } from 'mobx-keystone'
import { ProjectTrack } from '../../../../main/db/entities/ProjectTrack'

export const projectRef = rootRef<Project>('korus/ProjectRef', {
  onResolvedValueChange(ref, newValue, oldValue) {
    // what should happen when the resolved value changes?
    if (oldValue && !newValue) {
      detach(ref)
    }
  },
})

@model('korus/Project')
export class Project extends Model({
  id: idProp,
  name: prop<string>(), // a required String
  data: prop<any>(),
  tracks: tProp(types.array<any>(types.model(ProjectTrack))),
  createdAt: prop<Date>(),
  updatedAt: prop<Date>(),
}) {
  getRefId() {
    return this.id
  }
}
