import { detach, idProp, model, Model, prop, rootRef } from 'mobx-keystone'

export const projectTrackRef = rootRef<Setting>('korus/SettingRef', {
  onResolvedValueChange(ref, newValue, oldValue) {
    // what should happen when the resolved value changes?
    if (oldValue && !newValue) {
      detach(ref)
    }
  },
})

@model('korus/Setting')
export class Setting extends Model({
  id: idProp,
  key: prop<string>(),
  value: prop<any>().withSetter(),
}) {
  getRefId() {
    return this.id
  }
}
