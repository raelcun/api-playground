import { validateResponseMiddleware } from '@lib/response-validator-middleware'
import { getConfig } from '@modules/config'
import { getSystemLogger } from '@modules/logger'

export const validateResponse = validateResponseMiddleware(
  getSystemLogger,
  () => !getConfig().isProduction,
)
