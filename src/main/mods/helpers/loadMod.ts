import { spawn } from 'child_process'
import { getService } from 'core/Service'
import * as isBuiltInModule from 'is-builtin-module'
import * as path from 'path'
import { PopupService } from 'popup/PopupService'
import { getState } from 'state/StateService'
import { Mod } from '../../../connector/shared/state/models/Mod.model'
import { getBuildModPath as getBuiltModFolder } from '../../config'
import { createDirIfNotExist, writeStrFile } from '../../core/Files'
import { logger as mainLogger } from '../../core/Log'
import { ModsService } from '../ModsService'
import createModLogger from './createModLogger'
import createModSetting from './createModSetting'
import getModApi from './getModApi'
import IdStore from './IdStore'
import isModEnabled from './isModEnabled'
import logForMod from './logForMod'
let nextId = 0

const logger = mainLogger.child(`loadMod`)
const modData = IdStore<any, any>()

export default async function loadMod(mod: Mod) {
  const { disabled, osMatches } = mod
  const modsService = getService(ModsService)
  const popupService = getService(PopupService)
  const state = getState()
  const existingLoaded = state.mods.mods.find(m => m.id === mod.id)
  if (existingLoaded) {
    existingLoaded.setLoading(true)
  }

  if (mod.valid) {
    await createModSetting(mod)
  }

  const isEnabled = await isModEnabled(mod)
  mod.setDisabled(!isEnabled)

  if (!isEnabled && !mod.isBuiltIn) {
    // Don't automatically run externally added mods because we should warn the user first before enabling
    return
  }

  if (disabled || !osMatches) {
    mod.setDisabled(true)
    // Disable dev only mods (@disabled) and mods where the os doesn't match
    return
  } else {
    mod.setDisabled(false)
  }

  const api = await getModApi.call(modsService, mod)
  modsService.activeModApiIds[api.id] = api

  // Populate function scope with api objects
  const fileStr = `
module.exports = async function ({ ${[
    ...Object.keys(api),
    ...Object.keys(modsService.staticApi),
  ].join(', ')} }) {
${mod.contents}
}
`

  modData.update(mod.id, {
    api,
    logger: createModLogger(mod),
  })

  // Make folder for mod
  const modFolder = getBuiltModFolder(mod.id)
  await createDirIfNotExist(modFolder)
  const p = path.join(modFolder, `${mod.id}${nextId++}.js`)
  await writeStrFile(fileStr, p)

  const requireRegex = /require\('([^']+)'\)/g
  const nodeModules = Array.from(fileStr.matchAll(requireRegex))
    .map(m => m[1])
    .filter(module => !isBuiltInModule(module))

  if (nodeModules.length > 0) {
    // Try install npm modules in same folder withExec
    modsService.debug(`Installing ${nodeModules.join(', ')} for ${mod.id}`)
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
    const allApi = { ...api, ...modsService.staticApi }
    await fn(allApi)
  } catch (e) {
    modsService.error(`Error loading mod ${mod.id}`)
    modData.set(mod.id, {
      message: e.message,
      stack: e.stack,
    })
    popupService.showMessage(`Error loading ${mod.id}, check preferences for details`)
    logger.error(e)
  }
}
