import { RLWrapperBlackAndWhite, RateLimiterMemory } from 'rate-limiter-flexible'

export { rateLimitingMiddleware } from './middleware'

export const createLimiter = (keyPrefix: string, points = 100, duration = 10) =>
  new RLWrapperBlackAndWhite({
    limiter: new RateLimiterMemory({
      keyPrefix,
      points,
      duration,
    }),
    whiteList: ['127.0.0.1', '::ffff:127.0.0.1', '::1'],
  })
