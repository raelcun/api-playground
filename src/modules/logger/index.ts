import pino from 'pino'
import { FullConfig } from 'config/types'
import { getConfig } from 'config'
import { Logger } from './types'

export const getLoggerInternal = (getLoggingConfig: () => FullConfig['logging']) => (
  name: string,
) => {
  return pino({
    name,
    level: getLoggingConfig().level,
    prettyPrint: getLoggingConfig().prettyPrint,
  })
}

export const getLogger = getLoggerInternal(() => getConfig().logging)

export const getSystemLogger = (): Logger => getLogger('system')
