require('app-module-path').addPath(__dirname)

import { NestFactory } from '@nestjs/core'
import { AppModule } from './AppModule'

async function bootstrap() {
  const nestApp = await NestFactory.createApplicationContext(AppModule)
}
bootstrap()
