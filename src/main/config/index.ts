const path = require('path')
import { createDirIfNotExist, rmRfDir } from '../core/Files'
import { isMac, isWindows } from '../core/Os'

const os = require('os')
const isRenderer = require('is-electron-renderer')
const newUser = !!process.env.NEW_USER

const getAppDataPath = () => {
  const homedir = os.homedir()
  if (isMac()) {
    return path.join(homedir, 'Library', 'Application Support')
  } else if (isWindows()) {
    return path.join(homedir, 'AppData', 'Roaming')
  } else {
    throw new Error('Unsupported OS')
  }
}

export const basePath = isRenderer
  ? ''
  : path.join(getAppDataPath(), newUser ? `Lockpick-temp` : `Lockpick`)
export const sqlitePath = isRenderer ? '' : path.join(basePath, 'db.sqlite')
export const jsonPath = isRenderer ? '' : path.join(basePath, 'db.json')
export const sqliteBackupPath = isRenderer ? '' : path.join(basePath, 'backups')
export const storagePath = isRenderer ? '' : path.join(basePath, 'files')
export const buildModsPath: string = isRenderer ? '' : path.join(basePath, 'built-mods')

export const createFolders = async () => {
  if (newUser && process.env.NEW_USER_CLEAN) {
    await rmRfDir(basePath)
  }

  await createDirIfNotExist(getAppDataPath())
  await createDirIfNotExist(basePath)
  await createDirIfNotExist(storagePath)
  await createDirIfNotExist(sqliteBackupPath)
}
