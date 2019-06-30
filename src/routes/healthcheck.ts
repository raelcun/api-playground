import Router from 'koa-router'
import { rateLimitMiddleware, createLimiter } from '../modules/rate-limiter'
import packageJson from '../../package.json'

const router = new Router()

router.get(
  '/healthcheck',
  rateLimitMiddleware(createLimiter('healthcheck'), ctx => ctx.ip),
  ctx => {
    ctx.status = 200
    ctx.body = {
      version: packageJson.version,
    }
  },
)

export { router }
