import pino from 'pino'

import { getConfig } from '@config'
import { FullConfig } from '@config/types'

import { Logger } from './types'

export const getLoggerInternal = (getLoggingConfig: () => FullConfig['logging']) => (
  name: string,
) => {
  return pino({
    name,
    level: getLoggingConfig().level,
    useLevelLabels: true,
    prettyPrint: getLoggingConfig().prettyPrint,
  })
}

export const getLogger = getLoggerInternal(() => getConfig().logging)

export const getSystemLogger = (): Logger => getLogger('system')
