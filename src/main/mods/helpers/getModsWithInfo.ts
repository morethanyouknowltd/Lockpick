import { Keyed } from '@mtyk/types'
import { omit } from 'lodash'
import { getService } from '../../core/Service'
import { getDb } from '../../db'
import { Setting } from '../../db/entities/Setting'
import { SettingsService } from '../../settings/SettingsService'
import { ModInfo } from '../types'

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
  const byKey: Keyed<any> = {}

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
      const modInfo = omit(latestFoundModsMap[settingKey], 'logger')
      return {
        ...res,
        ...modInfo,
      }
    })
    .filter(mod => {
      return inMenu ? mod.value.showInMenu : true
    }) as any
}
