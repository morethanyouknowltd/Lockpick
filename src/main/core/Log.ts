import * as path from 'path'
import { basePath } from '../config'
const env = process.env as any
const winston = require('winston')
const flatted = require('flatted')

if (env.NODE_ENV === 'production') {
  env.ELECTRON_ENABLE_LOGGING = true
}

export const lockpickFileLogger = (
  opts: ConstructorParameters<typeof winston.transports.File>[0]
) => {
  return new winston.transports.File({
    ...(opts as any),
    stringify(obj) {
      return flatted.stringify(obj)
    },
  })
}

const print = winston.format.printf(info => {
  const log = `${info.level}: ${info.message}`

  return info.stack ? `${log}\n${info.stack}` : log
})

export const lockpickLogFormatter = winston.format.combine(
  winston.format.errors({ stack: true }),
  print
)

export const logger = winston.createLogger({
  level: 'info',
  format: lockpickLogFormatter,
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    lockpickFileLogger({
      filename: path.join(basePath, 'logs', 'error.log'),
      level: 'error',
    }),
    lockpickFileLogger({ filename: path.join(basePath, 'logs', 'combined.log') }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      colorize: true,
    })
  )
}
