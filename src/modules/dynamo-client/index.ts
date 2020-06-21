import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createDynamoClient } from '@lib/dynamo-client'
import { getConfig } from '@modules/config'

export const getDynamoClient = createDynamoClient(
  new DocumentClient({
    region: getConfig().aws.region,
    credentials: getConfig().aws.credentials,
  }),
)
