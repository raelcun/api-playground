import * as t from 'io-ts'
import { either as E } from 'fp-ts'
import HttpStatus from 'http-status-codes'
import { pipe } from 'fp-ts/lib/pipeable'
import { Lazy } from 'fp-ts/lib/function'
import { LoggerFactory } from 'modules/logger/types'
import { decode, logErrors, mapErrorCode } from 'utils'
import { Err } from 'modules/error/types'
import { Middleware } from 'koa'
import { getConfig } from 'config'
import { getSystemLogger } from 'modules/logger'

export const validateResponseInternal = (createLogger: LoggerFactory) => <T>(
  type: t.Type<T, unknown>,
) => (response: unknown): E.Either<Err<'RESPONSE_VALIDATION_ERROR'>, T> =>
  pipe(
    decode(type, response),
    mapErrorCode('RESPONSE_VALIDATION_ERROR'),
    logErrors(createLogger(), 'warn'),
  )

export const validateResponseMiddleware = (
  createLogger: LoggerFactory,
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

/* istanbul ignore next */
export const validateResponse = validateResponseMiddleware(
  getSystemLogger,
  () => !getConfig().isProduction,
)
