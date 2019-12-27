import pino from 'pino'
import { FullConfig } from 'configuration/types'
import { getConfig } from '../../configuration'
import { Logger } from './types'

export const getLoggerInternal = (getLoggingConfig: () => FullConfig['logging']) => (
  name: string,
) => {
  return pino({ name, level: getLoggingConfig().level })
}

export const getLogger = getLoggerInternal(() => getConfig().logging)

export const getSystemLogger = (): Logger => getLogger('system')
