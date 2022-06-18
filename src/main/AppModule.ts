import { Module } from '@nestjs/common'
import { BitwigService } from './bitwig/BitwigService'
import { TrayService } from './core/Tray'
import { SocketMiddlemanService } from './core/WebsocketToSocket'
import DbService from './db/DbService'
import { ModsService } from './mods/ModsService'
import { PopupService } from './popup/PopupService'
import { SettingsService } from './settings/SettingsService'
import { ShortcutsService } from './shortcuts/ShortcutsService'
import { StateService } from './state/StateService'
import { UIService } from './ui/UIService'

@Module({
  providers: [
    SocketMiddlemanService,
    StateService,
    SettingsService,
    DbService,
    PopupService,
    ShortcutsService,
    BitwigService,
    UIService,
    ModsService,
    TrayService,
  ],
})
export class AppModule {}
