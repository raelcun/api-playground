import pino, { Logger } from 'pino'

export const getEmergencyLogger = (): Logger =>
  pino({
    name: 'emergency',
    level: 'trace',
  })
