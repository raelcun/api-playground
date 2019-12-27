import t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { decode, logErrors, mapErrorCode } from 'utils'
import { either as E } from 'fp-ts'
import { Err } from 'modules/error/types'
import { LoggerFactory } from 'modules/logger/types'
import { getSystemLogger } from 'modules/logger'
import { Middleware, KoaContext } from 'types'
import HttpStatus from 'http-status-codes'
import { Middleware as KoaMiddleware } from 'koa'

export const validateBodyInner = (createLogger: LoggerFactory) => <T>(type: t.Type<T, unknown>) => (
  body: unknown,
): E.Either<Err<'BODY_VALIDATION_ERROR'>, T> =>
  pipe(
    decode(type, body),
    mapErrorCode('BODY_VALIDATION_ERROR' as const),
    logErrors(createLogger()),
  )

export const validateBody = validateBodyInner(getSystemLogger)

export const withValidatedBodyInner = (createLogger: LoggerFactory) => <T>(
  type: t.Type<T, unknown>,
) => (middleware: Middleware<T>): KoaMiddleware => async (ctx, next) => {
  const result = validateBodyInner(createLogger)(type)(ctx.request.body)

  if (E.isLeft(result)) {
    ctx.status = HttpStatus.BAD_REQUEST
    ctx.body = result.left
    return
  }

  await middleware(ctx as KoaContext<T>, next)
}

export const withValidatedBody = withValidatedBodyInner(getSystemLogger)
