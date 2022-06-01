var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { detach, idProp, model, Model, prop, rootRef } from 'mobx-keystone';
export const projectTrackRef = rootRef('korus/SettingRef', {
    onResolvedValueChange(ref, newValue, oldValue) {
        // what should happen when the resolved value changes?
        if (oldValue && !newValue) {
            detach(ref);
        }
    },
});
let Setting = class Setting extends Model({
    id: idProp,
    key: prop(),
    value: prop().withSetter(),
}) {
    getRefId() {
        return this.id;
    }
};
Setting = __decorate([
    model('korus/Setting')
], Setting);
export { Setting };
//# sourceMappingURL=Settings.model.js.map