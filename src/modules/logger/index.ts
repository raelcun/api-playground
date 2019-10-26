import pino from 'pino'
import { getConfig } from '../../config'
import { Logger } from './types'

export const getLogger = (name: string) => {
  return pino({ name, level: getConfig().logging.level })
}

export const getSystemLogger = (): Logger => getLogger('system')

export const createMockLogger = (
  overrides: Partial<
    Pick<pino.Logger, 'fatal' | 'trace' | 'error' | 'info' | 'debug' | 'warn' | 'child'>
  > = {},
): Logger => {
  return Object.assign(pino({ name: 'mockLogger', level: 'trace' }), overrides)
}
