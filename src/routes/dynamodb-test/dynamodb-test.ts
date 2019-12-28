import Router from 'koa-router'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { getConfig } from '@config'

const router = new Router()

router.get('/dynamodb-test', async ctx => {
  try {
    const result = await new DocumentClient({
      region: getConfig().aws.region,
      credentials: getConfig().aws.credentials,
    })
      .put({
        TableName: 'tasks',
        Item: { id: 'foo2' },
      })
      .promise()

    ctx.status = 200
    ctx.body = result
  } catch (e) {
    ctx.status = 500
    ctx.body = e
  }
})

export { router }
