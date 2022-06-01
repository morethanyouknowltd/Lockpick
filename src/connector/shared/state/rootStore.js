var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { model, Model, ModelAutoTypeCheckingMode, registerRootStore, setGlobalConfig, tProp, types, } from 'mobx-keystone';
import { BitwigState } from './BitwigState';
import { Project } from './models/Project.model';
import { ProjectTrack } from './models/ProjectTrack.model';
import { Setting } from './models/Settings.model';
import { Action } from './models/Actions.model';
const modlels = {
    Project,
    ProjectTrack,
    Setting,
    Action,
};
// for this example we will enable runtime data checking even in production mode
setGlobalConfig({
    modelAutoTypeChecking: ModelAutoTypeCheckingMode.AlwaysOn,
});
let RootState = class RootState extends Model({
    bitwig: tProp(types.model(BitwigState)),
}) {
};
RootState = __decorate([
    model('korus/RootState')
], RootState);
export { RootState };
export function createRootStore(state) {
    // as such, since this allows the model hook `onAttachedToRootStore` to work and other goodies
    console.log(state);
    registerRootStore(state);
    // we can also connect the store to the redux dev tools
    // const remotedev = require('remotedev')
    // const connection = remotedev.connectViaExtension({
    //   name: 'Todo List Example',
    // })
    // connectReduxDevTools(remotedev, connection, rootStore)
    return state;
}
//# sourceMappingURL=rootStore.js.map