import pino, { Logger as PinoLogger } from 'pino'

export interface Logger {
  fatal: PinoLogger['fatal']
  trace: PinoLogger['trace']
  error: PinoLogger['error']
  info: PinoLogger['info']
  debug: PinoLogger['debug']
  warn: PinoLogger['warn']
  child: PinoLogger['child']
}

export const getSystemLogger = () => pino({ name: 'system' })
