const { createLogger, format, transports } = require('winston')
const { consoleFormat } = require('winston-console-format')
const { MongoDB } = require('winston-mongodb')

module.exports = app => {
  if (!app) app = { get: () => undefined, set: () => undefined }

  const LogTransports = []

  LogTransports.push(new transports.Console({
    format: format.combine(
      format.colorize({ all: true }),
      format.padLevels(),
      consoleFormat({
        showMeta: true,
        metaStrip: ['timestamp', 'service'],
        inspectOptions: {
          depth: 8,
          colors: true,
          maxArrayLength: Infinity,
          breakLength: 120,
          compact: Infinity
        }
      })
    ),

    silent: app.get('env') === 'testing' || process.env.NO_CONSOLE_LOG === 'true'
  }))

  if (app.get('env') !== 'testing' && app.get('mongodb') && process.env.LOG_TO_DB === 'true') {
    LogTransports.push(new MongoDB({
      db: app.get('mongodb'),
      options: { useUnifiedTopology: true },
      storeHost: true,
      capped: true,
      tryReconnect: true
    }))
  }

  const logger = createLogger({
    level: process.env.LOG_LEVEL || 'silly',
    transports: LogTransports,
    format: format.combine(
      format.timestamp(),
      format.ms(),
      format.errors({ stack: app.get('env') === 'development' }),
      format.splat(),
      format.json()
    )
  })

  app.set('logger', logger)

  return logger
}
