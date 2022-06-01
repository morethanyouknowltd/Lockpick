const fs = require('fs/promises')
const path = require('path')
import { APP_NAME } from '../../../connector/shared/Constants'
import { getResourcePath } from '../../../connector/shared/ResourcePath'
import { buildModsPath } from '../../config'
import { createDirIfNotExist, exists as fileExists } from '../../core/Files'
import { logger as mainLogger } from '../../core/Log'

const logger = mainLogger.child('copyControllerScript')

export default async function copyControllerScript({ settingsService }) {
  const userLibPath = await settingsService.userLibraryPath()
  try {
    await fs.access(userLibPath!)
  } catch (e) {
    console.error(e)
    return logger.log('Not copying controller script until user library path set')
  }

  try {
    const controllerSrcFolder = getResourcePath('/controller-script')
    const controllerDestFolder = path.join(userLibPath!, 'Controller Scripts', APP_NAME)

    await createDirIfNotExist(controllerDestFolder)
    for (const file of [...(await fs.readdir(controllerSrcFolder)), 'mods.js']) {
      const src = (
        await fs.readFile(path.join(file === 'mods.js' ? buildModsPath : controllerSrcFolder, file))
      )
        .toString()
        .replace(/process\.env\.([a-zA-Z_-][a-zA-Z-_0-9]+)/g, (match, name) => {
          // logger.log(match, name)
          return JSON.stringify(process.env[name])
        })
      const dest = path.join(controllerDestFolder, file)
      if (!(await fileExists(dest)) || (await fs.readFile(dest)).toString() !== src) {
        await fs.writeFile(dest, src)
      }
    }
  } catch (e) {
    logger.error(e)
  }
}
