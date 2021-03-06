import { Context } from 'koa'

import { Message } from './types'

export const getMessageFromContext = (
  ctx: Context,
  options = { request: true, response: true },
): Omit<Message, 'level'> => ({
  ...(options.request && {
    request: {
      url: ctx.url,
      headers: ctx.headers,
      method: ctx.method,
    },
  }),
  ...(options.response && {
    response: {
      status: ctx.response.status,
      headers: ctx.response.headers,
      body: ctx.response.body,
    },
  }),
})

export const createTimingMessageSegment = (
  startNanos: bigint,
  startTime: Date,
  timingType: string,
): NonNullable<Message['timing']> => {
  const duration = Number(process.hrtime.bigint() - startNanos) / 1e6
  const startTimestamp = startTime.toISOString()
  const endTimestamp = new Date(startTime.getTime() + duration).toISOString()

  return {
    type: timingType,
    start: startTimestamp,
    end: endTimestamp,
    duration: Number(process.hrtime.bigint() - startNanos) / 1e6,
  }
}
