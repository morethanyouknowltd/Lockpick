import { promises as fs } from 'fs'
import { isString } from 'typed-assert'
import { Mod } from '../../../connector/shared/state/models/Mod.model'

export interface ModUpdate {
  contents: string
}

export default async function updateMod(mod: Mod, update: ModUpdate) {
  if ('contents' in update) {
    isString(update.contents)
    await fs.writeFile(mod.path, update.contents)
  }
}
