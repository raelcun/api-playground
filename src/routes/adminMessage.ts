import Router from 'koa-router'
import { RateLimiterMemory, RLWrapperBlackAndWhite } from 'rate-limiter-flexible'
import * as t from 'io-ts'
import { enforceWithBodyRole } from '../modules/security'
import { rateLimiter } from '../modules/rate-limiter'
import { validateRequestBody } from '../modules/validate-request-body-middleware'

const router = new Router()

const limiter = new RLWrapperBlackAndWhite({
  limiter: new RateLimiterMemory({
    keyPrefix: 'adminMessage',
    points: 5,
    duration: 5,
  }),
  whiteList: ['127.0.0.1', '::ffff:127.0.0.1', '::1'],
})

router.post(
  '/adminMessage',
  rateLimiter(limiter, ctx => ctx.ip),
  enforceWithBodyRole('account', ['editAny']),
  validateRequestBody(t.type({ message: t.string }).decode)(async ctx => {
    ctx.status = 200
    ctx.body = ctx.request.body.message
  }),
)

export { router }
