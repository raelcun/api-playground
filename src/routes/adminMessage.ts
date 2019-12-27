import Router from 'koa-router'
import * as t from 'io-ts'
import { withValidatedBody } from 'modules/validate-body'
import { validateResponse } from 'modules/middleware/validate-response'
import { enforceWithBodyRole } from 'modules/rbac'
import { rateLimitingMiddleware, createLimiter } from '../modules/middleware/rate-limiter'

const router = new Router()

router.post(
  '/adminMessage',
  rateLimitingMiddleware(createLimiter('adminMessage'), ctx => ctx.ip),
  enforceWithBodyRole('account', ['editAny']),
  withValidatedBody(t.type({ message: t.string }))(async ctx => {
    ctx.status = 200
    ctx.body = ctx.request.body.message
  }),
  validateResponse(t.string),
)

export { router }
