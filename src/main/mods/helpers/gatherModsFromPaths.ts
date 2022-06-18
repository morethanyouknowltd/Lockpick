import { promises as fs } from 'fs'
import * as path from 'path'
import { getResourcePath } from '../../../connector/shared/ResourcePath'
import { Mod } from '../../../connector/shared/state/models/Mod.model'
import { logger as mainLogger } from '../../core/Log'
import type { Keyed } from '@mtyk/types'
const colors = require('colors')
const logger = mainLogger.child('gatherModsFromPaths')

let nextId = 0

export default async function gatherModsFromPaths(
  paths: string[],
  { type }: { type: 'bitwig' | 'local' }
) {
  const modsById: Keyed<Mod> = {}
  // Load mods from all folders, with latter folders having higher precedence (overwriting by id)
  for (const modsFolder of paths) {
    const files = await fs.readdir(modsFolder)
    for (const filePath of files) {
      const actualType = filePath.indexOf('bitwig.js') >= 0 ? 'bitwig' : 'local'
      // console.log(filePath, actualType)
      if (filePath.substr(-3) !== '.js' || actualType !== type) {
        continue
      }
      try {
        const contents = await fs.readFile(path.join(modsFolder, filePath), 'utf8')
        const hasTag = (tag: string) => {
          const result = new RegExp(`@${tag}`).exec(contents)
          return !!result
        }
        const checkForTag = (tag: string) => {
          const result = new RegExp(`@${tag} (.*)`).exec(contents)
          return result ? result[1] : undefined
        }
        const id = checkForTag('id')
        const name = checkForTag('name') ?? 'No name set'
        const description = checkForTag('description') || ''
        const disabled = hasTag('disabled')
        const category = checkForTag('category') ?? 'global'
        const version = checkForTag('version') ?? '0.0.1'
        const os = checkForTag('os') ?? ''
        const creator = checkForTag('creator')
        const applications = checkForTag('applications')?.split(',') ?? []
        const noReload = contents.indexOf('@noReload') >= 0
        const settingsKey = `mod/${id}`
        const p = path.join(modsFolder, filePath)
        const isDefault = p.indexOf(getResourcePath('/default-mods')) >= 0
        const actualId = id === undefined ? 'temp' + nextId++ : id

        const thisOS: string =
          {
            darwin: 'macOS',
            win32: 'windows',
          }[require('os').platform() as string] || 'unknown'

        const osMatches =
          os === '' ||
          os.split(',').some(os => {
            return os.trim().toLowerCase() === thisOS.toLowerCase()
          })

        modsById[actualId] = new Mod({
          id: actualId,
          name,
          applications,
          disabled,
          osMatches,
          settingsKey,
          isBuiltIn: true, // FIXME
          description,
          category,
          actionCategories: {},
          actions: [],
          version,
          creator,
          contents,
          noReload,
          path: p,
          isDefault,
          valid: id !== undefined,
        })
      } catch (e) {
        logger.log(colors.red(`Error with ${filePath}`, e))
      }
    }
  }
  return modsById
}
