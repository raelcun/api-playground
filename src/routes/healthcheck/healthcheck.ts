import * as t from 'io-ts'
import Router from 'koa-router'

// import { createLimiter, rateLimitingMiddleware } from '@modules/rateLimiter'
import { validateResponse } from '@modules/validateResponse'
import packageJson from '@root/../package.json'

const router = new Router()

router.get(
  '/healthcheck',
  // rateLimitingMiddleware(createLimiter('healthcheck'), ctx => ctx.ip),
  ctx => {
    ctx.status = 200
    ctx.body = {
      version: packageJson.version,
      sha: process.env.GITHUB_SHA,
    }
  },
  validateResponse(t.type({ version: t.string })),
)

export { router }
