import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk/lib/error'
import { Response } from 'aws-sdk/lib/response'
import { taskEither as TE } from 'fp-ts'

import { Err } from '@modules/error/types'
import { ChangeTypeOfKeys } from '@root/utils/types'

export interface DynamoClient<T> {
  put: (
    params: ChangeTypeOfKeys<DocumentClient.PutItemInput, 'Item', T>,
  ) => TE.TaskEither<Err, Response<DocumentClient.PutItemOutput, AWSError>>
  delete: (
    params: DocumentClient.DeleteItemInput,
  ) => TE.TaskEither<Err, Response<DocumentClient.DeleteItemOutput, AWSError>>
}
