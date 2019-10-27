import { RateLimiterAbstract } from 'rate-limiter-flexible'
import { createMiddlewareTE } from 'utils'
import { KoaContext } from 'types'
import { createRateLimiter } from './limiter'

export const rateLimitingMiddleware = (
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<any>) => string,
) => createMiddlewareTE(createRateLimiter(limiter, getKey))
