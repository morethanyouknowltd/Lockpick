require('app-module-path').addPath(__dirname)
require('@cspotcode/source-map-support').install()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './AppModule'
import { app, session } from 'electron'
import * as path from 'path'
import * as os from 'os'

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

const reactDevToolsPath = path.join(
  os.homedir(),
  `/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0`
)
async function bootstrap() {
  await session.defaultSession.loadExtension(reactDevToolsPath)
  setTimeout(async () => {
    const nestApp = await NestFactory.createApplicationContext(AppModule)
    if (process.env.NODE_ENV === 'dev') {
      setApplicationActiveApplescript()
    }
  }, 1000 * 1)
}

app.whenReady().then(bootstrap)
