require('app-module-path').addPath(__dirname)
require('@cspotcode/source-map-support').install()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './AppModule'
import { app } from 'electron'

function setApplicationActiveApplescript() {
  const script = `
    tell application "System Events"
      set frontApp to name of first process whose frontmost = true
      tell application "Visual Studio Code"
        activate
      end tell
    end tell
  `
  require('child_process').exec(`osascript -e '${script}'`)
}

async function bootstrap() {
  setTimeout(async () => {
    const nestApp = await NestFactory.createApplicationContext(AppModule)
    if (process.env.NODE_ENV === 'dev') {
      setApplicationActiveApplescript()
    }
  }, 1000 * 1)
}
app.whenReady().then(bootstrap)
