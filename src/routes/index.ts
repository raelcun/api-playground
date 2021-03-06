import Router from 'koa-router'

import { router as adminThingRouter } from './adminMessage'
import { router as healthcheckRouter } from './healthcheck'
import { router as taskRouter } from './tasks'

export const router = new Router({ prefix: '/v1' })
  .use(adminThingRouter.routes(), adminThingRouter.allowedMethods())
  .use(healthcheckRouter.routes(), healthcheckRouter.allowedMethods())
  .use(taskRouter.routes(), taskRouter.allowedMethods())
