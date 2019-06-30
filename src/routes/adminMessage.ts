import Router from 'koa-router'
import * as t from 'io-ts'
import { enforceWithBodyRole } from '../modules/security'
import { rateLimitMiddleware, createLimiter } from '../modules/rate-limiter'
import { validateRequestBody } from '../modules/validate-request-body-middleware'

const router = new Router()

router.post(
  '/adminMessage',
  rateLimitMiddleware(createLimiter('adminMessage'), ctx => ctx.ip),
  enforceWithBodyRole('account', ['editAny']),
  validateRequestBody(t.type({ message: t.string }).decode)(async ctx => {
    ctx.status = 200
    ctx.body = ctx.request.body.message
  }),
)

export { router }
