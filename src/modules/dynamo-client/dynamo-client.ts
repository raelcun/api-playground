import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk/lib/error'
import { taskEither as TE } from 'fp-ts'

import { getConfig } from '@config'

import { DynamoClient } from './types'

export const createDynamoClientInternal = (baseClient: DocumentClient): DynamoClient<any> => ({
  put: item =>
    TE.tryCatch(
      () =>
        baseClient
          .put(item)
          .promise()
          .then(result => result.$response),
      (reason: AWSError) => ({
        code: reason.code || 'UNKNOWN_AWS_ERROR',
        message: reason.message || 'unknown failure while putting data',
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
