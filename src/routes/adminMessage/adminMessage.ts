import * as t from 'io-ts'
import Router from 'koa-router'

import { createResponseV, createSuccessResponse } from '@root/lib/api-core/response'
import { createLimiter, rateLimitingMiddleware } from '@modules/rateLimiter'
import { enforceWithBodyRole } from '@modules/rbac'
import { withValidatedBody } from '@modules/validateBody'
import { validateResponse } from '@modules/validateResponse'

const router = new Router()

router.post(
  '/adminMessage',
  rateLimitingMiddleware(createLimiter('adminMessage'), ctx => ctx.ip),
  enforceWithBodyRole('adminMessage', ['post']),
  withValidatedBody(t.type({ message: t.string }))(async ctx => {
    ctx.request.
    ctx.status = 200
    ctx.body = createSuccessResponse(ctx.request.body.message)
  }),
  validateResponse(createResponseV(t.string)),
)

export { router }
