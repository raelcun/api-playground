import { either as E } from 'fp-ts'
import HttpStatus from 'http-status-codes'
import * as t from 'io-ts'
import { Middleware as KoaMiddleware } from 'koa'

import { validateBody } from '@lib/body-validator'
import { LoggerFactory } from '@lib/logger'
import { createErrorResponse, KoaContext, Middleware } from '@modules/api-core'

export const withValidatedBody = (createLogger: LoggerFactory) => <T>(type: t.Type<T, unknown>) => (
  middleware: Middleware<T>,
): KoaMiddleware => async (ctx, next) => {
  const result = validateBody(createLogger)(type)(ctx.request.body)

  if (E.isLeft(result)) {
    ctx.status = HttpStatus.BAD_REQUEST
    ctx.body = createErrorResponse(result.left)
    return
  }

  await middleware(ctx as KoaContext<T>, next)
}
