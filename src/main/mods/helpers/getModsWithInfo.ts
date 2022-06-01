import * as _ from 'lodash'
import { getService } from '../../core/Service'
import { SettingsService } from '../../core/SettingsService'
import { getDb } from '../../db'
import { Setting } from '../../db/entities/Setting'
import { ModInfo } from '../ModInfo'

export default async function getModsWithInfo(
  { latestFoundModsMap, category, inMenu, modId } = {} as any
): Promise<(ModInfo & { key: string; value: any })[]> {
  const settingsService = getService(SettingsService)
  const db = await getDb()
  const settings = db.getRepository(Setting)
  const where = { type: 'mod' } as any
  if (category) {
    where.category = category
  }
  if (modId) {
    where.key = `mod/${modId}`
  }
  const results = await settings.find({ where })
  const byKey = {}
  for (const r of results) {
    byKey[r.key] = r
  }
  return Object.keys(latestFoundModsMap)
    .filter(key => {
      const matchesModQuery = !modId || `mod/${modId}` === key
      const notDisabled = !latestFoundModsMap[key].disabled
      return matchesModQuery && notDisabled
    })
    .map(settingKey => {
      const res = byKey[settingKey]
        ? settingsService.postload(byKey[settingKey])
        : {
            value: {
              enabled: false,
              keys: [],
            },
          }
      const modInfo = _.omit(latestFoundModsMap[settingKey], 'logger')
      return {
        ...res,
        ...modInfo,
      }
    })
    .filter(mod => {
      return inMenu ? mod.value.showInMenu : true
    }) as any
}
