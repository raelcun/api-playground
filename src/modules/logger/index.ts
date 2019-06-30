import pino from 'pino'
import { Logger } from './types'

export const getLogger = (name: string) => pino({ name })

export const getSystemLogger = (): Logger => getLogger('system')
