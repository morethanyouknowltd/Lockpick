require('app-module-path').addPath(__dirname)
require('@cspotcode/source-map-support').install()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './AppModule'
import { app } from 'electron'

async function bootstrap() {
  setTimeout(async () => {
    const nestApp = await NestFactory.createApplicationContext(AppModule)
  }, 1000 * 1)
}
app.whenReady().then(bootstrap)
