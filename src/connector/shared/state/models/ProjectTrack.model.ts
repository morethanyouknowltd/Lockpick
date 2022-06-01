import { detach, idProp, model, Model, prop, rootRef } from 'mobx-keystone'

export const projectTrackRef = rootRef<ProjectTrack>('korus/ProjectTrackRef', {
  onResolvedValueChange(ref, newValue, oldValue) {
    // what should happen when the resolved value changes?
    if (oldValue && !newValue) {
      detach(ref)
    }
  },
})

@model('korus/ProjectTrack')
export class ProjectTrack extends Model({
  id: idProp,
  key: prop<string>(),
  value: prop<any>().withSetter(),
}) {
  getRefId() {
    return this.id
  }
}
