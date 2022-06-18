import { getService } from 'core/Service'
import { SettingsService } from 'settings/SettingsService'
import { Mod } from '../../../connector/shared/state/models/Mod.model'

export default async function createModSetting(mod: Mod) {
  const settingsService = getService(SettingsService)
  await settingsService.insertSettingIfNotExist({
    key: mod.settingsKey,
    value: {
      enabled: false,
      keys: [],
    },
    type: 'mod',
  })
}
