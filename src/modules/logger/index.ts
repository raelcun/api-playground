import pino from 'pino'
import { getConfig } from '../../config'
import { Logger } from './types'

export const getLogger = (name: string) => pino({ name, level: getConfig().logging.level })

export const getSystemLogger = (): Logger => getLogger('system')
