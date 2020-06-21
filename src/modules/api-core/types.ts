import * as t from 'io-ts'
import Koa from 'koa'

import { RolesV } from '@lib/rbac'

interface KoaRequest<T> extends Koa.Request {
  body: T
}

export interface KoaContext<T> extends Koa.Context {
  request: KoaRequest<T>
}
export type KoaContext2<T> = Koa.ParameterizedContext<Koa.DefaultState, { request: { body: T } }>

type a = Koa.Middleware<Koa.DefaultState, { request: { body: T } }>

export type Middleware<T> = (ctx: KoaContext<T>, next: () => Promise<void>) => Promise<void>

export const tokenV = t.type({
  userId: t.string,
  role: RolesV,
})
export type Token = t.TypeOf<typeof tokenV>
