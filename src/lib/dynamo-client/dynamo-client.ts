import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk/lib/error'
import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { Err } from '@lib/error'
import { logErrorsTE, LoggerProvider } from '@lib/logger'
import { tryCatchTE } from '@lib/utils'

import { DynamoClient } from './types'

type BaseClient = Pick<DocumentClient, 'put' | 'delete'>

const wrapDynamoRequestWithErrorHandling = <A>(f: () => Promise<A>) =>
  TE.chain(() =>
    tryCatchTE(
      f,
      (reason: AWSError | Error): Err => ({
        code: 'DYNAMO_CLIENT_ERROR',
        subcode: <string>reason['code'] || 'UNKNOWN_ERROR',
        message: reason.message,
      }),
    ),
  )

const logRequest = (
  getLogger: LoggerProvider,
  params: unknown,
  message: string,
): TE.TaskEither<Err<string, string>, unknown> =>
  TE.right(
    getLogger().log({
      level: 'trace',
      payload: { message, meta: { params } },
    }),
  )

export const createDynamoClient = (baseClient: BaseClient) => (
  getLogger: LoggerProvider,
): DynamoClient<any> => ({
  put: params =>
    pipe(
      logRequest(getLogger, params, 'putting document'),
      wrapDynamoRequestWithErrorHandling(() =>
        baseClient
          .put(params)
          .promise()
          .then(result => result.$response),
      ),
      logErrorsTE(getLogger(), 'error'),
    ),

  delete: params =>
    pipe(
      logRequest(getLogger, params, 'deleting document'),
      wrapDynamoRequestWithErrorHandling(() =>
        baseClient
          .delete(params)
          .promise()
          .then(result => result.$response),
      ),
      logErrorsTE(getLogger(), 'error'),
    ),
})
