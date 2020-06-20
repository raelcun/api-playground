import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk/lib/error'
import { taskEither as TE } from 'fp-ts'

import { getConfig } from '@modules/config'

import { DynamoClient } from './types'

export const createDynamoClientInternal = (baseClient: DocumentClient): DynamoClient<any> => ({
  put: params =>
    TE.tryCatch(
      () =>
        baseClient
          .put(params)
          .promise()
          .then(result => result.$response),
      (reason: AWSError) => ({
        code: 'DYNAMO_CLIENT_ERROR',
        subCode: reason.code || 'UNKNOWN_ERROR',
        message: reason.message || 'unknown failure while putting data',
      }),
    ),

  delete: params =>
    TE.tryCatch(
      () =>
        baseClient
          .delete(params)
          .promise()
          .then(result => result.$response),
      (reason: AWSError) => ({
        code: 'DYNAMO_CLIENT_ERROR',
        subCode: reason.code || 'UNKNOWN_AWS_ERROR',
        message: reason.message || 'unknown failure while deleting data',
      }),
    ),
})

let dynamoClient: DynamoClient<any>
export const getDynamoClient = () => {
  if (dynamoClient === undefined) {
    dynamoClient = createDynamoClientInternal(
      new DocumentClient({
        region: getConfig().aws.region,
        credentials: getConfig().aws.credentials,
      }),
    )
  }

  return dynamoClient
}
