import Router from 'koa-router'

import { router as adminThingRouter } from './adminMessage'
import { router as dynamoDbTestRouter } from './dynamodb-test'
import { router as healthcheckRouter } from './healthcheck'

export const router = new Router({ prefix: '/v1' })
  .use(adminThingRouter.routes(), adminThingRouter.allowedMethods())
  .use(healthcheckRouter.routes(), healthcheckRouter.allowedMethods())
  .use(dynamoDbTestRouter.routes(), dynamoDbTestRouter.allowedMethods())
