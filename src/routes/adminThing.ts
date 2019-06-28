import Router from 'koa-router'
import { RateLimiterMemory, RLWrapperBlackAndWhite } from 'rate-limiter-flexible'
import { enforceWithBodyRole } from '../modules/security'
import { rateLimiter } from '../modules/rate-limiter'
import { validateRequestBody } from '../modules/validate-request-body-middleware'
import * as t from 'io-ts'

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
  rateLimiter(limiter, ctx => ctx.ip),
  enforceWithBodyRole('account', ['editAny']),
  // validateRequestBody(t.type({ role: t.string }).decode),
  ctx => {
    ctx.status = 200
    ctx.body = 'here is your admin thing'
  },
)

export { router }
