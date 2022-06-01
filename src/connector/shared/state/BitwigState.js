var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { model, Model, prop, tProp, types } from 'mobx-keystone';
import { Action } from './models/Actions.model';
import { Project } from './models/Project.model';
import { ProjectTrack } from './models/ProjectTrack.model';
import { Setting } from './models/Settings.model';
let BitwigState = class BitwigState extends Model({
    actions: tProp(types.array(types.model(Action)), () => []),
    projects: tProp(types.array(types.model(Project)), () => []),
    projectTracks: tProp(types.array(types.model(ProjectTrack)), () => []),
    settings: tProp(types.array(types.model(Setting)), () => []),
    activeProject: prop(),
}) {
};
BitwigState = __decorate([
    model('korus/BitwigState')
], BitwigState);
export { BitwigState };
//# sourceMappingURL=BitwigState.js.map