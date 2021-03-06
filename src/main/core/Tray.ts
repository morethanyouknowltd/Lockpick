import { app, BrowserWindow, Menu, Tray } from 'electron'
import { APP_NAME } from '../../connector/shared/Constants'
import { getAppPath, getResourcePath } from '../../connector/shared/ResourcePath'
import getModsWithInfo from '../mods/helpers/getModsWithInfo'
import { ModsService } from '../mods/ModsService'
import { ShortcutsService } from '../shortcuts/ShortcutsService'
import { isWindows } from './Os'
import { BESService } from './Service'
import { SettingsService } from '../settings/SettingsService'
import { url } from './Url'
import { addAPIMethod, interceptPacket, SocketMiddlemanService } from './WebsocketToSocket'
import { Injectable } from '@nestjs/common'
const path = require('path')
const { Bitwig } = require('bindings')('bes')

@Injectable()
export class TrayService extends BESService {
  timer: any
  animationI = 0
  connected = false
  settingsWindow?: BrowserWindow

  constructor(
    protected settingsService: SettingsService,
    protected modsService: ModsService,
    protected shortcutsService: ShortcutsService,
    protected socketService: SocketMiddlemanService
  ) {
    super('TrayService')
  }

  async onModuleInit() {
    const tray = new Tray(getResourcePath('/images/tray-0Template.png'))

    await this.settingsService.insertSettingIfNotExist({
      key: 'setupComplete',
      value: false,
      type: 'boolean',
    })
    const isSetupComplete = async () => await this.settingsService.getSettingValue('setupComplete')

    const openWindow = async ({ type }: { type: string }) => {
      const loadUrl = url(`/#/${type}`)
      if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
        this.settingsWindow.close()
      }
      this.settingsWindow = new BrowserWindow({
        width: 1200,
        height: 770,
        minWidth: 870,
        minHeight: 620,
        show: false,
        titleBarStyle: 'hiddenInset',
        frame: isWindows(),
        webPreferences: {
          preload: getAppPath('/dist/preload.js'),
        },
      })
      this.settingsWindow.loadURL(loadUrl)
      this.settingsWindow.show()
      if (process.platform === 'darwin') {
        app.dock.show()
        this.settingsWindow.once('close', () => {
          app.dock.hide()
        })
      }
    }

    this.shortcutsService.addActionToShortcutRegistry(
      {
        title: `Open Lockpick Preferences`,
        id: 'open-preferences-internal',
        action: () => openWindow({ type: 'settings' }),
        defaultSetting: {
          keys: ['Meta', 'Shift', ','],
        },
      },
      { keys: [], special: 'null' }
    )

    const updateMenu = async () => {
      const modItems: Electron.MenuItemConstructorOptions[] = (
        await getModsWithInfo({
          latestFoundModsMap: this.modsService.latestFoundModsMap,
          inMenu: true,
        })
      ).map(modSetting => {
        return {
          label: modSetting.name,
          checked: modSetting.value.enabled,
          type: 'checkbox',
          click: () => {
            this.settingsService.setSettingValue(modSetting.key, {
              ...modSetting.value,
              enabled: !modSetting.value.enabled,
            })
          },
        }
      })
      const contextMenu = Menu.buildFromTemplate([
        { label: `${APP_NAME}: ${this.connected ? 'Connected' : 'Connecting...'}`, enabled: false },
        {
          label: `Report an Issue...`,
          click: () => {
            require('electron').shell.openExternal(`mailto:andy@morethanyouknow.co.uk`)
          },
        },
        ...(Bitwig.isAccessibilityEnabled(false)
          ? []
          : [
              {
                label: 'Enable Accessibility',
                click: () => {
                  Bitwig.isAccessibilityEnabled(true)
                },
              },
            ]),
        ...((modItems.length ? [{ type: 'separator' }, ...modItems] : []) as any),
        { type: 'separator' },
        { label: 'Preferences...', click: () => openWindow({ type: 'settings' }) },
        { label: 'Setup...', click: () => openWindow({ type: 'setup' }) },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            app.quit()
          },
        },
      ])
      tray.setContextMenu(contextMenu)
    }

    const imageOrWarning = (str: string) => {
      if (!Bitwig.isAccessibilityEnabled(false)) {
        return getResourcePath(`/images/tray-warningTemplate.png`)
      }
      return str
    }
    const onNotConnected = () => {
      // if (this.timer) {
      //     clearInterval(this.timer)
      // }
      // this.timer = setInterval(() => {
      //     tray.setImage(imageOrWarning(getResourcePath(`/images/tray-${this.animationI % 6}Template.png`)))
      //     this.animationI++
      // }, 250)
    }

    this.socketService.events.connected.listen(isConnected => {
      this.connected = isConnected
      if (isConnected && this.timer) {
        // clearInterval(this.timer)
        tray.setImage(imageOrWarning(getResourcePath(`/images/tray-0Template.png`)))
      } else {
        onNotConnected()
      }
      updateMenu()
    })
    onNotConnected()
    updateMenu()

    interceptPacket('api/setup/finish', async () => {
      await this.settingsService.setSettingValue('setupComplete', true)
    })
    interceptPacket('api/setup/accessibility', async () => {
      Bitwig.isAccessibilityEnabled(true)
    })
    addAPIMethod('api/settings/reload', async () => {
      openWindow({ type: 'settings' })
    })

    addAPIMethod('api/setup/browse', async () => {
      const { dialog } = require('electron')
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections'],
      })
      return filePaths
    })
    addAPIMethod('api/setup/relaunch', async () => {
      app.relaunch()
      app.exit(0)
    })
    addAPIMethod('api/setup/library-default', async () => {
      return path.join(app.getPath('home'), 'Documents', 'Bitwig Studio')
    })

    this.settingsService.events.settingsUpdated.listen(() => updateMenu())
    this.modsService.events.modsReloaded.listen(() => updateMenu())

    const setupComplete = await isSetupComplete()
    const isDev = process.env.NODE_ENV === 'dev'
    if (!setupComplete) {
      openWindow({ type: 'setup' })
    } else {
      if (!process.env.QUIET_START) {
        openWindow({ type: 'settings' })
        if (isDev) {
          // this.settingsWindow.toggleDevTools()
        }
      } else {
        app.dock.hide()
      }
    }
  }
}
