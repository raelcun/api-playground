import { Middleware } from 'koa'

import { createTimingMessageSegment, getMessageFromContext, LoggerFactory } from '@modules/logger'

export const createMiddleware = (createLogger: LoggerFactory): Middleware => async (ctx, next) => {
  const startTime = new Date()
  const startNanos = process.hrtime.bigint()

  createLogger().info(getMessageFromContext(ctx))

  let err: any = undefined
  try {
    await next()
  } catch (e) {
    err = e
  }

  createLogger().info({
    ...getMessageFromContext(ctx),
    timing: createTimingMessageSegment(startNanos, startTime, 'RESPONSE_TIMING'),
  })

  if (err !== undefined) throw err
}
