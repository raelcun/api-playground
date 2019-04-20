import { KoaContext } from '../koa-middleware-enhancers'

export type Middleware<T> = (
  ctx: KoaContext<T>,
  next: () => Promise<void>,
) => Promise<void>
