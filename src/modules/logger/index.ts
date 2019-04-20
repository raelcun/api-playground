import pino, { Logger as PinoLogger } from 'pino'

export type Logger = Pick<
  PinoLogger,
  'fatal' | 'trace' | 'error' | 'info' | 'debug' | 'warn' | 'child'
>

export const getLogger = (name: string) => pino({ name })

export const getSystemLogger = (): Logger => getLogger('system')
