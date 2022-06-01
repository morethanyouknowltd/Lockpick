require('@cspotcode/source-map-support').install()
require('app-module-path').addPath(__dirname)

import { app, protocol, shell } from 'electron'
import { BitwigService } from './bitwig/BitwigService'
import { createFolders } from './config'
import { logger } from './core/Log'
import { registerService } from './core/Service'
import { SettingsService } from './core/SettingsService'
import { TrayService } from './core/Tray'
import { SocketMiddlemanService } from './core/WebsocketToSocket'
import { ModsService } from './mods/ModsService'
import { PopupService } from './popup/PopupService'
import { ShortcutsService } from './shortcuts/ShortcutsService'
import { StateService } from './state/StateService'
import { UIService } from './ui/UIService'

app.whenReady().then(async () => {
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
    const services = {
      socketMiddleMan: await registerService(SocketMiddlemanService),
      stateService: await registerService(StateService),
      settingsService: await registerService<SettingsService>(SettingsService),
      popupService: await registerService(PopupService),
      shortcutsService: await registerService(ShortcutsService),
      bitwigService: await registerService(BitwigService),
      uiService: await registerService(UIService),
      modsService: await registerService(ModsService),
      trayService: await registerService(TrayService),
    }

    // Service creation order is manually controlled atm, but each
    // has dependencies
    // TODO automate this - is error prone
    services.settingsService.insertSettingIfNotExist({
      key: 'userLibraryPath',
      value: '',
      type: 'string',
    })

    for (const key in services) {
      services[key].postActivate()
    }
  } catch (e) {
    logger.error(e)
  }

  const unhandled = require('electron-unhandled')
  unhandled({
    logger: (...args) => {
      logger.error(...args)
    },
    showDialog: true,
    reportButton: error => {
      console.log('Report Button Initialized')
    },
  })
})
