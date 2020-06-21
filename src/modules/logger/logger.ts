import { createLogger as libCreateLogger, Logger } from '@lib/logger'
import { getConfig } from '@modules/config'

export const createLogger = (): Logger => libCreateLogger(() => getConfig().logging)
