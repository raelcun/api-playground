import { Logger as PinoLogger } from 'pino'

export type Logger = Pick<
  PinoLogger,
  'fatal' | 'trace' | 'error' | 'info' | 'debug' | 'warn' | 'child'
>
