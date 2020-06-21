import { Middleware } from 'koa'
import { v4 as uuid } from 'uuid'

import { createTimingMessageSegment, getMessageFromContext, LoggerProvider } from '@lib/logger'
import { getLogger2 } from '@modules/logger'

export const createMiddleware = (getLogger: LoggerProvider): Middleware => async (ctx, next) => {
  const startTime = new Date()
  const startNanos = process.hrtime.bigint()

  ctx.state.logger = getLogger2().pinValues({
    traceId: uuid(),
    ...getMessageFromContext(ctx, { request: true, response: false }),
  })

  let err: any = undefined
  try {
    await next()
  } catch (e) {
    err = e
  }

  getLogger().info({
    ...getMessageFromContext(ctx),
    timing: createTimingMessageSegment(startNanos, startTime, 'RESPONSE_TIMING'),
  })

  if (err !== undefined) throw err
}
