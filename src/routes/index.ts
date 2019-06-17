import Router from 'koa-router'
import { router as adminThingRouter } from './adminThing'
import { router as healthcheckRouter } from './healthcheck'

export const router = new Router()
  .use(adminThingRouter.routes(), adminThingRouter.allowedMethods())
  .use(healthcheckRouter.routes(), healthcheckRouter.allowedMethods())
