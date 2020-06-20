import { createMiddleware } from '@lib/logging-middleware'
import { getSystemLogger } from '@modules/logger'

export const logRequest = createMiddleware(getSystemLogger)
