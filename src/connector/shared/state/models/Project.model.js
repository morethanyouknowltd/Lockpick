var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { detach, idProp, model, Model, prop, rootRef, tProp, types } from 'mobx-keystone';
import { ProjectTrack } from './ProjectTrack.model';
export const projectRef = rootRef('korus/ProjectRef', {
    onResolvedValueChange(ref, newValue, oldValue) {
        // what should happen when the resolved value changes?
        if (oldValue && !newValue) {
            detach(ref);
        }
    },
});
let Project = class Project extends Model({
    id: idProp,
    name: prop(),
    data: prop(),
    tracks: tProp(types.array(types.model(ProjectTrack))),
    createdAt: prop(),
    updatedAt: prop(),
}) {
    getRefId() {
        return this.id;
    }
};
Project = __decorate([
    model('korus/Project')
], Project);
export { Project };
//# sourceMappingURL=Project.model.js.map