import { either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import t from 'io-ts'

import { Err } from '@lib/error'
import { logErrorsE, LoggerProvider } from '@lib/logger'
import { decode, mapErrorCode } from '@lib/utils'

export const validateBody = (getLogger: LoggerProvider) => <T>(type: t.Type<T, unknown>) => (
  body: unknown,
): E.Either<Err<'BODY_VALIDATION_ERROR'>, T> =>
  pipe(decode(type, body), logErrorsE(getLogger()), mapErrorCode('BODY_VALIDATION_ERROR' as const))
