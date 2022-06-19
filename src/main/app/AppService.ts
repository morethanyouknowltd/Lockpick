import { Injectable } from '@nestjs/common'
import { app, protocol, shell } from 'electron'
import { SettingsService } from 'settings/SettingsService'
import { createFolders } from '../config'
import { logger } from '../core/Log'

@Injectable()
export default class AppService {
  constructor(protected settings: SettingsService) {}

  async onApplicationBootstrap() {
    await this.settings.insertSettingIfNotExist({
      key: 'userLibraryPath',
      value: '',
      type: 'string',
    })

    await createFolders()

    app.on('web-contents-created', (e, contents) => {
      contents.on('new-window', (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
      })
      contents.on('will-navigate', (e, url) => {
        if (url !== contents.getURL()) e.preventDefault(), shell.openExternal(url)
      })
    })
    try {
      app.whenReady().then(() => {
        protocol.registerFileProtocol('safefile', (request, callback) => {
          const pathNoProtocol = request.url.replace('safefile://', '')
          console.log('Received file protocol request:', request.url, pathNoProtocol)
          callback({ path: pathNoProtocol })
        })
      })

      // Service creation order is manually controlled atm, but each
      // has dependencies
      // TODO automate this - is error prone
    } catch (e) {
      logger.error(e)
    }

    // const unhandled = require('electron-unhandled')
    // unhandled({
    //   logger: (...args: any[]) => {
    //     logger.error(...args)
    //   },
    //   showDialog: true,
    //   reportButton: (error: any) => {
    //     console.log('Report Button Initialized')
    //   },
    // })
  }
}
