import { getService } from '../../core/Service'
import { SettingsService } from '../../core/SettingsService'

export default async function isModEnabled(mod) {
  if (process.env.SAFE_MODE === 'true') {
    return false
  }
  return (await getService(SettingsService).getSetting(mod.settingsKey))?.value.enabled ?? false
}
