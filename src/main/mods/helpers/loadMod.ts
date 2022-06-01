import * as path from 'path'
import * as winston from 'winston'
import { buildModsPath } from '../../config'
import { spawn } from 'child_process'
import { createDirIfNotExist, writeStrFile } from '../../core/Files'
import { lockpickFileLogger, logger as mainLogger } from '../../core/Log'
import getModApi from './getModApi'
import logForMod from './logForMod'
import * as isBuiltInModule from 'is-builtin-module'
import type { ModsService } from '../ModsService'
import isModEnabled from './isModEnabled'
let nextId = 0

const logger = mainLogger.child(`loadMod`)

export default async function loadMod(this: ModsService, mod: any) {
  const { disabled, osMatches } = mod
  await this.initModAndStoreInMap(mod)
  const isEnabled = await isModEnabled(mod)
  mod.enabled = isEnabled

  if (!isEnabled && !mod.isBuiltIn) {
    // Don't automatically run externally added mods because we should warn the user first before enabling
    return
  }

  if (disabled || !osMatches) {
    mod.enabled = false
    mod.disabled = true
    // Disable dev only mods (@disabled) and mods where the os doesn't match
    return
  } else {
    mod.disabled = false
  }

  const api = await getModApi.call(this, mod)
  this.activeModApiIds[api.id] = api

  // Populate function scope with api objects
  const fileStr = `
module.exports = async function ({ ${[...Object.keys(api), ...Object.keys(this.staticApi)].join(
    ', '
  )} }) {
${mod.contents}
}
`
  // Make folder for mod
  const modFolder = path.join(buildModsPath, mod.id)
  await createDirIfNotExist(modFolder)
  const p = path.join(modFolder, `${mod.id}${nextId++}.js`)
  await writeStrFile(fileStr, p)

  // Create a logger in the subdirectory for this mod only
  mod.logger = winston.createLogger({
    defaultMeta: { mod: mod.id },
    // format: lockpickLogFormatter,
    transports: [
      lockpickFileLogger({
        filename: path.join(modFolder, 'log.log'),
        level: 'debug',
      }),
      new winston.transports.Console({
        level: 'warn',
      }),
    ],
  })

  const requireRegex = /require\('([^']+)'\)/g
  const nodeModules = Array.from(fileStr.matchAll(requireRegex))
    .map(m => m[1])
    .filter(module => !isBuiltInModule(module))

  if (nodeModules.length > 0) {
    // Try install npm modules in same folder withExec
    this.debug(`Installing ${nodeModules.join(', ')} for ${mod.id}`)
    const result = spawn('yarn', ['add', ...nodeModules, '--non-interactive', '--no-progress'], {
      cwd: modFolder,
      stdio: 'inherit',
    })
    // wait for result to finish
    await new Promise((resolve, rej) => {
      result.on('error', rej)
      result.on('close', resolve)
    })
  }

  logForMod(mod.id, 'debug', `About to load ${mod.name} from ${p}`)
  try {
    const fn = require(p)
    const allApi = { ...api, ...this.staticApi }
    await fn(allApi)
  } catch (e) {
    this.error(`Error loading mod ${mod.id}`)
    mod.error = {
      message: e.message,
      stack: e.stack,
    }
    this.popupService.showMessage(`Error loading ${mod.id}, check preferences for details`)
    logger.error(e)
  }
}
