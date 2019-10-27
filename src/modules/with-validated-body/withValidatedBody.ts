import t from 'io-ts'
import HttpStatus from 'http-status-codes'
import { reporter } from 'io-ts-reporters'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as IO from 'fp-ts/lib/IO'
import { flow } from 'fp-ts/lib/function'
import { Middleware, KoaContext } from '../../types'
import { Logger } from '../logger/types'

const logValidationError = <T>(ctx: KoaContext<T>, logger: Logger) => (
  errors: t.Errors,
): IO.IO<void> => () => {
  logger.trace(
    { requestBody: ctx.request.body, validationError: reporter(E.left(errors)) },
    `body validation failed for ${ctx.url}`,
  )
}

const setErrorContext = <T>(ctx: KoaContext<T>) => (errors: t.Errors): IO.IO<void> => () => {
  ctx.status = HttpStatus.BAD_REQUEST
  ctx.body = {
    errors: reporter(E.left(errors)),
  }
}

export const withValidatedBodyInner = (logger: Logger) => <T>(type: t.Type<T, unknown>) => (
  middleware: Middleware<T>,
): Middleware<T> => async (ctx, next) =>
  await pipe(
    type.decode(ctx.request.body),
    E.mapLeft(errors =>
      flow(
        setErrorContext(ctx)(errors),
        logValidationError(ctx, logger)(errors),
      ),
    ),
    E.fold(io => Promise.resolve(io()), () => middleware(ctx, next)),
  )
