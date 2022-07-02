import { newModsState } from '../state/NewModsState'

export default function useSelectedMod() {
  return newModsState.mods.selectedItem
}
