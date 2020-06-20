import { createLogger, Logger } from '@lib/logger'
import { getConfig } from '@modules/config'

export const getLogger = createLogger(() => getConfig().logging)

export const getSystemLogger = (): Logger => getLogger('system')
