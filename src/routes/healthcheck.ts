import Router from 'koa-router'
import { RateLimiterMemory, RLWrapperBlackAndWhite } from 'rate-limiter-flexible'
import { rateLimiter } from '../modules/rate-limiter'
import packageJson from '../../package.json'

const router = new Router()

const limiter = new RLWrapperBlackAndWhite({
  limiter: new RateLimiterMemory({
    keyPrefix: 'healthcheck',
    points: 10,
    duration: 5,
  }),
  whiteList: ['127.0.0.1', '::ffff:127.0.0.1', '::1'],
})

router.get('/healthcheck', rateLimiter(limiter, ctx => ctx.ip), ctx => {
  ctx.status = 200
  ctx.body = {
    version: packageJson.version,
  }
})

export { router }
