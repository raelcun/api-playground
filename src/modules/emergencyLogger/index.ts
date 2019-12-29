import pino from 'pino'

export const getEmergencyLogger = () =>
  pino({
    name: 'emergency',
    level: 'trace',
  })
