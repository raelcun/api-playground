import { RateLimiterAbstract } from 'rate-limiter-flexible'

import { createRateLimiter } from '@lib/rate-limiter'
import { createMiddlewareTE } from '@lib/utils'
import { KoaContext } from '@modules/api-core'

export const rateLimitingMiddleware = (
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<unknown | undefined>) => string,
) => createMiddlewareTE(createRateLimiter(limiter, getKey))
