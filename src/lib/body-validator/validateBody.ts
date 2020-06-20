import { either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import t from 'io-ts'

import { Err } from '@lib/error'
import { LoggerFactory } from '@lib/logger'
import { decode, logErrors, mapErrorCode } from '@lib/utils'

export const validateBody = (createLogger: LoggerFactory) => <T>(type: t.Type<T, unknown>) => (
  body: unknown,
): E.Either<Err<'BODY_VALIDATION_ERROR'>, T> =>
  pipe(
    decode(type, body),
    mapErrorCode('BODY_VALIDATION_ERROR' as const),
    logErrors(createLogger()),
  )
