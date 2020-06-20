import * as t from 'io-ts'
import Router from 'koa-router'

import { createLimiter } from '@lib/rate-limiter'
import { createResponseV, createSuccessResponse } from '@modules/api-core'
import { rateLimitingMiddleware } from '@modules/rate-limiter-middleware'
import { validateResponse } from '@modules/response-validator-middleware'

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
