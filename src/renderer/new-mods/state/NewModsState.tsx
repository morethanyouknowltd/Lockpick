import { ArraySelectionStore, DocumentEditStore } from '@mtyk/frontend/mobx'
import { makeAutoObservable } from 'mobx'
import { Mod } from '../../../connector/shared/state/models/Mod.model'

export class NewModsState {
  mods = new ArraySelectionStore<Mod>({ autoSelectFirst: true })
  modEditorState = new DocumentEditStore()
  constructor() {
    makeAutoObservable(this)
  }
}

export const newModsState = new NewModsState()
