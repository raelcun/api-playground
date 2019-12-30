import { Middleware } from 'koa'

import { getSystemLogger } from './logger'
import { LoggerFactory } from './types'

const hrTimeToMs = (hrTime: [number, number]) => hrTime[0] * 1e3 + hrTime[1] / 1e6

export const createMiddleware = (createLogger: LoggerFactory): Middleware => async (ctx, next) => {
  const start = process.hrtime()

  let err: any = undefined
  try {
    await next()
  } catch (e) {
    err = e
  }

  createLogger().info({
    method: ctx.method,
    path: ctx.url,
    responseStatus: ctx.status,
    duration: hrTimeToMs(process.hrtime(start)),
  })

  if (err !== undefined) throw err
}

export const middleware = createMiddleware(getSystemLogger)
