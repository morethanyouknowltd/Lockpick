import { makeAutoObservable } from 'mobx'
import { ArraySelectionStore } from '@mtyk/frontend/mobx'
import { Mod } from 'connector/shared/state/models/Mod.model'

export class NewModsState {
  mods = new ArraySelectionStore({ autoSelectFirst: true })

  constructor() {
    makeAutoObservable(this)
  }
}

export const newModsState = new NewModsState()
