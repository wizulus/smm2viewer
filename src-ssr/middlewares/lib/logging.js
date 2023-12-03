import Log4js from 'log4js'

const logLevels = ['all', 'trace', 'debug', 'info', 'warn', 'error', 'fatal', 'mark', 'off']
/** @typedef {'all'|'trace'|'debug'|'info'|'warn'|'error'|'fatal'|'mark'|'off'} LogLevel */

/** @type {import('../../node_modules/log4js/types/log4js.js').Log4js} */
const log4js = Log4js.configure({
  appenders: {
    out: {
      type: 'stdout'
    }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: process.env.LOG_LEVEL || 'debug'
    }
  }
})

export function getLogger (name) {
  const logger = log4js.getLogger(name)
  return logger
}
