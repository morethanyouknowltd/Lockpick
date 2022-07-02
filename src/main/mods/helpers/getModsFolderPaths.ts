const path = require('path')
import { Optional } from '@mtyk/types'
import { createDirIfNotExist } from '../../core/Files'
import { getService } from '../../core/Service'
import { SettingsService } from '../../settings/SettingsService'
import getDefaultModsFolderPath from './getDefaultModsFolderPath'

export async function getUserModsFolderPath(): Promise<Optional<string>> {
  const settingsService = getService(SettingsService)
  const userLibPath = await settingsService.lockpickLibraryLocation()
  if (userLibPath) {
    const modsFolder = path.join(userLibPath, 'Mods')
    await createDirIfNotExist(modsFolder)
    return modsFolder
  }
}

export default async function getModsFolderPaths(): Promise<string[]> {
  const modsFolder = await getUserModsFolderPath()
  return [getDefaultModsFolderPath(), ...(modsFolder ? [modsFolder] : [])]
}
