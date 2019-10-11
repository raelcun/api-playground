import Router from 'koa-router'
import * as t from 'io-ts'
import { enforceWithBodyRole } from '../modules/middleware/security'
import { rateLimitMiddleware, createLimiter } from '../modules/middleware/rate-limiter'
import { withValidatedBody } from '../modules/with-validated-body'

const router = new Router()

router.post(
  '/adminMessage',
  rateLimitMiddleware(createLimiter('adminMessage'), ctx => ctx.ip),
  enforceWithBodyRole('account', ['editAny']),
  withValidatedBody(t.type({ message: t.string }))(async ctx => {
    ctx.status = 200
    ctx.body = ctx.request.body.message
  }),
)

export { router }
