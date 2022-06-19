import { lockpickFileLogger } from 'core/Log'
const winston = require('winston')
import { Mod } from '../../../connector/shared/state/models/Mod.model'
import * as path from 'path'
import { getBuildModPath } from 'config'

export default function createModLogger(mod: Mod) {
  // Create a logger in the subdirectory for this mod only
  return winston.createLogger({
    defaultMeta: { mod: mod.id },
    transports: [
      lockpickFileLogger({
        filename: path.join(getBuildModPath(mod.id), 'log.log'),
        level: 'debug',
      }),
      new winston.transports.Console({
        level: 'warn',
      }),
    ],
  })
}
