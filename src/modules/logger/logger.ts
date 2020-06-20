import pino from 'pino'

import { LoggingConfig } from './types'

export const createLogger = (getLoggingConfig: () => LoggingConfig) => (name: string) => {
  return pino({
    name,
    level: getLoggingConfig().level,
    prettyPrint: getLoggingConfig().prettyPrint,
  })
}
