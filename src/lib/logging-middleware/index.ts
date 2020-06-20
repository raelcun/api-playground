import { getSystemLogger } from '@lib/logger'
import { createMiddleware } from '@modules/logging-middleware'

export const middleware = createMiddleware(getSystemLogger)
