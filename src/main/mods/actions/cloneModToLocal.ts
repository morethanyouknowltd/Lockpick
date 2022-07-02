import { assertIsDefined } from '@mtyk/util'
import { promises as fs } from 'fs'
import * as path from 'path'
import { Mod } from '../../../connector/shared/state/models/Mod.model'
import { getUserModsFolderPath } from '../helpers/getModsFolderPaths'

export default async function cloneModToLocal(mod: Mod) {
  const localModsPath = await getUserModsFolderPath()
  assertIsDefined(localModsPath, 'No local mods folder found')
  const pathToWrite = path.join(localModsPath!, path.basename(mod.path))
  await fs.writeFile(pathToWrite, mod.contents)
}
