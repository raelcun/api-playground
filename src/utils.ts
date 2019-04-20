import Router from 'koa-router'
import Koa from 'koa'

export const createServer = (router: Router): Koa =>
  new Koa().use(router.routes()).use(router.allowedMethods())
