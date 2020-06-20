import { withValidatedBody as innerMiddleware } from '@lib/body-validator-middleware'
import { getSystemLogger } from '@modules/logger'

export const withValidatedBody = innerMiddleware(getSystemLogger)
