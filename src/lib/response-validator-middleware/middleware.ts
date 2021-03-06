import { either as E } from 'fp-ts'
import { Lazy } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import * as t from 'io-ts'
import { Middleware } from 'koa'

import { Err } from '@lib/error'
import { LoggerProvider } from '@lib/logger'
import { decode, logErrorsE, mapErrorCode } from '@lib/utils'

const validateResponseInternal = (createLogger: LoggerProvider) => <T>(type: t.Type<T, unknown>) => (
  response: unknown,
): E.Either<Err<'RESPONSE_VALIDATION_ERROR'>, T> =>
  pipe(
    decode(type, response),
    mapErrorCode('RESPONSE_VALIDATION_ERROR'),
    logErrorsE(createLogger(), 'warn'),
  )

export const validateResponseMiddleware = (
  createLogger: LoggerProvider,
  shouldError: Lazy<boolean>,
) => <T>(type: t.Type<T, unknown>): Middleware => async (ctx, next) => {
  pipe(
    validateResponseInternal(createLogger)(type)(ctx.body),
    E.fold(
      () => {
        if (shouldError()) {
          ctx.status = HttpStatus.INTERNAL_SERVER_ERROR
        } else {
          next()
        }
      },
      () => {
        next()
      },
    ),
  )
}
