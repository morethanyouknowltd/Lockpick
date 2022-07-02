import { addOrReplace } from '@mtyk/util'

import { Mod, ModAction, ModSetting } from '../../../connector/shared/state/models/Mod.model'
import { getService } from '../../core/Service'
import { SettingsService } from '../../settings/SettingsService'
import { ShortcutsService } from '../../shortcuts/ShortcutsService'
import { ActionSpec } from '../../shortcuts/ShortcutTypes'
import { ModsService } from '../ModsService'
import logForMod from './logForMod'
import colors = require('colors')
import { logger } from '../../core/Log'
import { omit, pick } from 'lodash'

export default async function loadAction(mod: Mod, actionSpec: ActionSpec) {
  const settingsService = getService(SettingsService)
  const shortcutsService = getService(ShortcutsService)
  const modsService = getService(ModsService)

  // Some of the functions below are async, and we'd rather not restrict mod
  // authors to have to await registerAction() each time. So, we keep track of
  // how many are waiting to fulfil and then update the shortcut cache when
  // we know everything is done.
  shortcutsService.pauseCacheUpdate()

  const existingSetting = await settingsService.getSetting(actionSpec.id)
  if (existingSetting && existingSetting.mod !== mod.id) {
    modsService.error(
      colors.red(`Action with id ${actionSpec.id} already exists for mod ${mod.id}. Overwriting`)
    )
    await settingsService.deleteSetting(actionSpec.id)
  }

  await settingsService.insertSettingIfNotExist({
    key: actionSpec.id,
    mod: mod.id,
    value: {
      keys: [],
    },
    type: 'shortcut',
  })
  logForMod(mod.id, 'info', colors.green(`Registered action: ${actionSpec.id}`))

  try {
    const setting = (await settingsService.getSetting(actionSpec.id))!
    const settingValue = setting.value
    const newAction = new ModAction({
      ...omit(actionSpec, 'action'),
      setting: new ModSetting({
        ...pick(setting, 'value'),
        id: setting.key,
        description: actionSpec.description,
        name: actionSpec.title,
      }),
    })
    newAction.action = actionSpec.action

    const newActions = addOrReplace(mod.actions, a => a.id === newAction.id, newAction)
    mod.setActions(newActions)
    if (!mod.disabled) {
      const wrappedAction = async (...args: any[]) => {
        try {
          await (async () => actionSpec.action(...args))()
        } catch (e) {
          logForMod(mod.id, 'error', colors.red(e))
        }
      }
      shortcutsService.addActionToShortcutRegistry(
        {
          ...actionSpec,
          action: wrappedAction,
        },
        settingValue
      )
      modsService.onReloadMods.push(() => {
        shortcutsService.removeActionFromShortcutRegistry(actionSpec.id)
      })
    } else {
      modsService.log(`Skipping action register ${actionSpec.id}, mod ${mod.id} not enabled`)
    }
  } catch (e) {
    modsService.error(e)
  }
  shortcutsService.unpauseCacheUpdate()
}
