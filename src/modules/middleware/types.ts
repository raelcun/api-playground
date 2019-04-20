import Koa from 'koa'

interface KoaRequest<T> extends Koa.Request {
  body: T
}

export interface KoaContext<T> extends Koa.Context {
  request: KoaRequest<T>
}

export type Middleware<T> = (ctx: KoaContext<T>, next: () => Promise<void>) => Promise<void>
