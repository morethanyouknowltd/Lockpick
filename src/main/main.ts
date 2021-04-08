import { app, shell, BrowserWindow, Tray } from "electron";
import { ShortcutsService } from "./shortcuts/ShortcutsService";
import { registerService } from "./core/Service";
import { SocketMiddlemanService } from "./core/WebsocketToSocket";
import { TrayService } from "./core/Tray";
import { SettingsService } from "./core/SettingsService";
import { protocol } from "electron";
import { ModsService } from "./mods/ModsService";
import { BitwigService } from "./bitwig/BitwigService";
import { UIService } from "./ui/UIService";
import { PopupService } from "./popup/PopupService";
import { createFolders } from "./config";
import { logger } from "./core/Log"

app.whenReady().then(async () => {
  await createFolders()

  app.on('web-contents-created', (e, contents) => {
      contents.on('new-window', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
      });
      contents.on('will-navigate', (e, url) => {
        if (url !== contents.getURL()) e.preventDefault(), shell.openExternal(url);
      });
  });
  try {
    app.whenReady().then(() => {
      protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = request.url.replace('file:///', '');
        callback(pathname);
      });
    });   
    const services = {
      socketMiddleMan: await registerService(SocketMiddlemanService),
      settingsService: await registerService<SettingsService>(SettingsService),
      popupService: await registerService(PopupService),
      shortcutsService: await registerService(ShortcutsService),
      bitwigService: await registerService(BitwigService),
      uiService: await registerService(UIService),
      modsService: await registerService(ModsService),
      trayService: await registerService(TrayService)
    }

    // Service creation order is manually controlled atm, but each
    // has dependencies
    // TODO automate this - is error prone
    services.settingsService.insertSettingIfNotExist({
      key: 'userLibraryPath',
      value: '',
      type: 'string',
    })

    for (const key in services){
      services[key].postActivate()
    }
  } catch (e) {
    
    logger.error(e)
  }

  const unhandled = require('electron-unhandled');
  unhandled({
    logger: (...args) => {
      logger.error(...args)
    },
    showDialog: true,
    reportButton: (error) => {
        console.log('Report Button Initialized');
    }
  });
})