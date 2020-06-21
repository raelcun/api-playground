import { either as E, taskEither as TE } from 'fp-ts'

import { Err } from '@lib/error'

import { Logger, LogMethods } from './types'

export const logErrorsE = <L extends Err<string>>(logger: Logger, method: LogMethods = 'trace') =>
  E.mapLeft<L, L>(e => {
    logger.log({ level: method, payload: e })
    return e
  })

export const logErrorsTE = <L extends Err<string>>(logger: Logger, method: LogMethods = 'trace') =>
  TE.mapLeft<L, L>(e => {
    logger.log({ level: method, payload: e })
    return e
  })
