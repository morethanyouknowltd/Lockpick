import { makeAutoObservable } from "mobx"
import { sendPromise } from "../bitwig-api/Bitwig"
import _ from 'underscore'

class State {
    modsById: {[id: string]: any} = {};
    disableOneFetch = false;

    *fetchMods({ selected }: any = {}) {
        if (this.disableOneFetch) {
            this.disableOneFetch = false
            return
        }
        const mods = (yield sendPromise({type: 'api/mods'})).data
        console.log('Fetched all mods')
        const modsById = _.indexBy(mods, 'id')

        if (selected) {
            const mod = (yield sendPromise({type: 'api/mod', data: { id: selected.id }})).data
            modsById[mod.id] = {...modsById[mod.id], ...mod}
            console.log(`Also fetched ${mod.id}`)
        }
        this.modsById = modsById
    }

    get modsArray() {
        return Object.values(this.modsById)
    } 

    /**
     * Update a specific mod in the local state
     */
    *reloadMod(id) {
        const mod = (yield sendPromise({type: 'api/mod', data: { id }})).data
        console.log('Reloaded mod to :', mod)
        this.modsById[mod.id] = mod
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export const state = new State()