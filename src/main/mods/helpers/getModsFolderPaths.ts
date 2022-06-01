const path = require('path')
import { APP_NAME } from '../../../connector/shared/Constants'
import { createDirIfNotExist, exists as fileExists } from '../../core/Files'
import { getService } from '../../core/Service'
import { SettingsService } from '../../core/SettingsService'
import getDefaultModsFolderPath from './getDefaultModsFolderPath'

export default async function getModsFolderPaths(): Promise<string[]> {
  const settingsService = getService(SettingsService)
  const userLibPath = await settingsService.userLibraryPath()
  const exists = typeof userLibPath === 'string' && (await fileExists(userLibPath))
  if (exists) {
    await createDirIfNotExist(path.join(userLibPath!, APP_NAME))
    await createDirIfNotExist(path.join(userLibPath!, APP_NAME, 'Mods'))
  }
  return [
    getDefaultModsFolderPath(),
    ...(exists ? [path.join((await settingsService.lockpickLibraryLocation())!, 'Mods')] : []),
  ]
}
