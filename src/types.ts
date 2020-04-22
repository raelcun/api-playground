import Koa from 'koa'

interface KoaRequest<T> extends Koa.Request {
  body: T
}

export interface KoaContext<T> extends Koa.Context {
  request: KoaRequest<T>
}

export type Middleware<T> = (ctx: KoaContext<T>, next: () => Promise<void>) => Promise<void>

type Primitive = string | number | boolean | bigint | symbol | undefined | null
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Primitive
    ? T[P]
    : T[P] extends Function
    ? T[P]
    : T[P] extends Date
    ? T[P]
    : T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]>
}
