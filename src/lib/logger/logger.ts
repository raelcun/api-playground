import { getConfig } from '@config'
import { createLogger } from '@modules/logger'
import { Logger } from '@modules/logger/types'

export const getLogger = createLogger(() => getConfig().logging)

export const getSystemLogger = (): Logger => getLogger('system')
