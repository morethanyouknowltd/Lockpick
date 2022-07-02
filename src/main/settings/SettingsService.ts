import { Optional } from '@mtyk/types'
import { Injectable } from '@nestjs/common'
import DBService from 'db/DbService'
import * as path from 'path'
import { APP_NAME } from '../../connector/shared/Constants'
import { BESService, getService, makeEvent } from '../core/Service'
import { addAPIMethod, SocketMiddlemanService } from '../core/WebsocketToSocket'
import { SettingTemplate } from './SettingsTypes'

@Injectable()
export class SettingsService extends BESService {
  events = {
    settingsUpdated: makeEvent<void>(),
    settingUpdated: makeEvent<Partial<SettingTemplate>>(),
  }
  socketService = getService(SocketMiddlemanService)
  Settings: any

  constructor(protected dbService: DBService) {
    super('SettingsService')
  }

  async onModuleInit() {
    addAPIMethod('api/settings/set', async setting => {
      await this.setSettingValue(setting.key, setting.value)
    })
    addAPIMethod('api/settings/get-value', async key => {
      return await this.getSettingValue(key)
    })
    addAPIMethod('api/settings/get', async key => {
      return await this.getSetting(key)
    })

    const settings = [
      {
        key: 'uiScale',
        value: '100%',
        type: 'string',
      },
      {
        key: 'uiLayout',
        value: 'Single Display (Large)',
        type: 'string',
      },
    ]
    for (const setting of settings) {
      this.insertSettingIfNotExist(setting as any)
    }
  }

  async onSettingValueChange(key: string, cb: (value: any) => any) {
    this.events.settingUpdated.listen(setting => {
      if (setting.key === key) {
        cb(setting.value)
      }
    })

    try {
      // Call with initial value
      if (await this.settingExists(key)) {
        cb(await this.getSettingValue(key))
      }
    } catch (e) {
      this.error(`Error calling callback when setting changed`, e)
    }
  }

  async getSettingsForCategory(category: string) {
    return this.dbService.settings.find({ where: { category } })
  }

  preSave(setting: Partial<SettingTemplate>) {
    if (setting.type && setting.type in { string: true }) {
      return setting
    } else {
      return {
        ...setting,
        value: JSON.stringify(setting.value),
      }
    }
  }

  postload(setting: Partial<SettingTemplate>) {
    if (setting.type && setting.type in { string: true }) {
      return setting
    } else {
      return {
        ...setting,
        value: JSON.parse(setting.value),
      }
    }
  }

  async insertSettingIfNotExist(setting: SettingTemplate) {
    const existingSetting = await this.dbService.settings.findOne({ where: { key: setting.key } })
    if (!existingSetting) {
      const content = this.preSave(setting)
      const newSetting = await this.dbService.settings.create(content)
      await this.dbService.settings.save(newSetting)
      this.log('Inserted new setting: ', newSetting)
      // this.events.settingsUpdated.emit()
      // this.events.settingUpdated.emit(content)
    }
  }

  async removeAllForMod(modId: string) {
    await this.dbService.settings.delete({ mod: modId })
  }

  async getSetting(key: string) {
    const setting = await this.dbService.settings.findOne({ where: { key } })
    return setting ? this.postload(setting) : null
  }

  async deleteSetting(key: string) {
    await this.dbService.settings.delete({ key })
  }

  async settingExists(key: string) {
    const setting = await this.dbService.settings.findOne({ where: { key } })
    return !!setting
  }

  async getSettingValue(key: string) {
    const setting = await this.dbService.settings.findOne({ where: { key } })
    if (!setting) {
      throw new Error(`Setting ${key} not found`)
    }
    return this.postload(setting).value
  }

  async getSettingValueOrNull(key: string) {
    const setting = await this.dbService.settings.findOne({ where: { key } })
    if (!setting) {
      return null
    }
    return this.postload(setting).value
  }

  async upsertSetting(setting: SettingTemplate) {
    const exists = await this.settingExists(setting.key)
    if (!exists) {
      return this.insertSettingIfNotExist(setting)
    } else {
      return await this.setSettingValue(setting.key, setting.value)
    }
  }

  async setSettingValue(key: string, value: any) {
    const setting = await this.getSetting(key)
    if (!setting) {
      throw new Error(`Setting ${key} not found`)
    }
    const update = this.preSave({ type: setting.type, value })
    await this.dbService.settings.update({ key }, update)

    this.events.settingsUpdated.emit()
    this.events.settingUpdated.emit({
      key,
      ...update,
    })
    this.socketService.sendPacketToBrowser({
      type: 'settings/updated',
    })
  }

  async userLibraryPath(): Promise<Optional<string>> {
    try {
      return await this.getSettingValue('userLibraryPath')
    } catch (e) {
      return undefined
    }
  }

  async lockpickLibraryLocation(): Promise<Optional<string>> {
    try {
      const userLib = await this.getSettingValue('userLibraryPath')
      return path.join(userLib, APP_NAME)
    } catch (e) {
      return undefined
    }
  }

  normalise(label: string) {
    return label.replace(/[\s]+/g, '-').toLowerCase()
  }
}
