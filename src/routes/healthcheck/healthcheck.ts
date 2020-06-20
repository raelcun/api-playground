import * as t from 'io-ts'
import Router from 'koa-router'

import { createResponseV, createSuccessResponse } from '@root/lib/api-core/response'
import { createLimiter, rateLimitingMiddleware } from '@modules/rateLimiter'
import { validateResponse } from '@modules/validateResponse'

const router = new Router()

router.get(
  '/healthcheck',
  rateLimitingMiddleware(createLimiter('healthcheck'), ctx => ctx.ip),
  ctx => {
    ctx.status = 200
    ctx.body = createSuccessResponse({})
  },
  validateResponse(createResponseV(t.object)),
)

export { router }
