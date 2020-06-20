import * as t from 'io-ts'
import Router from 'koa-router'

import { createLimiter } from '@lib/rate-limiter'
import { enforceWithBodyRole } from '@lib/rbac-middleware'
import { createResponseV, createSuccessResponse } from '@modules/api-core'
import { withValidatedBody } from '@modules/body-validator-middleware'
import { rateLimitingMiddleware } from '@modules/rate-limiter-middleware'
import { validateResponse } from '@modules/response-validator-middleware'

const router = new Router()

router.post(
  '/adminMessage',
  rateLimitingMiddleware(createLimiter('adminMessage'), ctx => ctx.ip),
  enforceWithBodyRole('adminMessage', ['post']),
  withValidatedBody(t.type({ message: t.string }))(async ctx => {
    ctx.request.ctx.status = 200
    ctx.body = createSuccessResponse(ctx.request.body.message)
  }),
  validateResponse(createResponseV(t.string)),
)

export { router }
