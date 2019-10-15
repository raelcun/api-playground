import { RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible'
import { getSystemLogger } from '../../logger'
import { KoaContext, Middleware } from '../../../types'

export const rateLimitMiddleware = <T>(
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<T>) => string,
): Middleware<T> => async (ctx, next) => {
  try {
    const result = await limiter.consume(getKey(ctx))

    ctx.set('X-RateLimit-Remaining', result.remainingPoints.toString())
    ctx.set('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString())

    await next()
  } catch (e) {
    getSystemLogger().trace(`rate limited for request to ${ctx.url}`, e)

    ctx.status = 429

    if (e.remainingPoints !== undefined && e.msBeforeNext !== undefined) {
      const error = e as RateLimiterRes

      ctx.set('X-RateLimit-Remaining', error.remainingPoints.toString())
      ctx.set('X-RateLimit-Reset', new Date(Date.now() + error.msBeforeNext).toISOString())
    }
  }
}