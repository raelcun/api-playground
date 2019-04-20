import Router from 'koa-router'
import {
  RateLimiterMemory,
  RLWrapperBlackAndWhite,
  RateLimiterRes,
} from 'rate-limiter-flexible'
import { enforceWithBodyRole } from '../modules/koa-middleware'
import { getSystemLogger } from '../modules/logger'

const router = new Router()

const limiter = new RLWrapperBlackAndWhite({
  limiter: new RateLimiterMemory({
    keyPrefix: 'adminThing',
    points: 5,
    duration: 5,
  }),
  whiteList: ['127.0.0.1', '::ffff:127.0.0.1', '::1'],
})

router.post(
  '/adminThing',
  async (ctx, next) => {
    try {
      const result = await limiter.consume(ctx.ip)

      ctx.set('X-RateLimit-Remaining', result.remainingPoints.toString())
      ctx.set(
        'X-RateLimit-Reset',
        new Date(Date.now() + result.msBeforeNext).toISOString(),
      )

      await next()
    } catch (e) {
      getSystemLogger().trace(`rate limited for request to ${ctx.url}`, e)

      ctx.status = 429

      const error = e as RateLimiterRes
      console.log(error)

      ctx.set('X-RateLimit-Remaining', error.remainingPoints.toString())
      ctx.set(
        'X-RateLimit-Reset',
        new Date(Date.now() + error.msBeforeNext).toISOString(),
      )
    }
  },
  enforceWithBodyRole('account', ['editAny']),
  ctx => {
    ctx.status = 200
    ctx.body = 'here is your admin thing'
  },
)

export { router }
