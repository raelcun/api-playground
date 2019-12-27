import Router from 'koa-router'
import * as t from 'io-ts'
import { rateLimitingMiddleware, createLimiter } from '../modules/middleware/rate-limiter'
import packageJson from '../../package.json'
import { validateResponse } from '../modules/middleware/validate-response'

const router = new Router()

router.get(
  '/healthcheck',
  rateLimitingMiddleware(createLimiter('healthcheck'), ctx => ctx.ip),
  ctx => {
    ctx.status = 200
    ctx.body = {
      version: packageJson.version,
    }
  },
  validateResponse(t.type({ version: t.string })),
)

export { router }
