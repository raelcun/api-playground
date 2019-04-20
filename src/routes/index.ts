import Router from 'koa-router'
import { router as adminThingRouter } from './adminThing'

export const router = new Router()
  .use(adminThingRouter.routes())
  .use(adminThingRouter.allowedMethods())
