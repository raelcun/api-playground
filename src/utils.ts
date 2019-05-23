import Router from 'koa-router'
import Koa from 'koa'
import * as t from 'io-ts'

export const createServer = (router: Router): Koa =>
  new Koa().use(router.routes()).use(router.allowedMethods())

export const DateFromString = new t.Type<Date, string, unknown>(
  'DateFromString',
  (u): u is Date => u instanceof Date,
  (u, c) =>
    t.string.validate(u, c).chain(s => {
      const d = new Date(s)
      return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d)
    }),
  a => a.toISOString(),
)
