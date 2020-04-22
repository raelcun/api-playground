import { Logger as PinoLogger } from 'pino'

export type LogMethods = 'fatal' | 'trace' | 'error' | 'info' | 'debug' | 'warn'

export type Logger = Pick<PinoLogger, LogMethods | 'child'>

export type LoggerFactory = () => Logger
