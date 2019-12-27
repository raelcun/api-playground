import { RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible'
import { KoaContext } from 'types'
import { option as O, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import { createMiddlewareTE } from 'utils'
import { Err } from '../error/types'

type LimiterConsumeError = Err & { remaining: O.Option<number>; msBeforeNext: O.Option<number> }

const limiterConsume = (
  limiter: RateLimiterAbstract,
  key: string,
): TE.TaskEither<LimiterConsumeError, RateLimiterRes> =>
  TE.tryCatch(
    () => limiter.consume(key),
    (e: any) => {
      return {
        code: 'LIMITER_CONSUME_FAILED',
        remaining: O.fromNullable(e.remainingPoints),
        msBeforeNext: O.fromNullable(e.msBeforeNext),
      }
    },
  )

const setRateLimitXHeaders = <T>(ctx: KoaContext<T>) => (
  remaining: O.Option<number>,
  msBeforeNext: O.Option<number>,
) => {
  if (O.isSome(remaining)) {
    ctx.set('X-RateLimit-Remaining', remaining.value.toString())
  }
  if (O.isSome(msBeforeNext)) {
    ctx.set('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext.value).toISOString())
  }
}

export const createRateLimiter = (
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<unknown>) => string,
) => (ctx: KoaContext<unknown>): TE.TaskEither<Err, void> =>
  pipe(
    limiterConsume(limiter, getKey(ctx)),
    TE.map(result => {
      setRateLimitXHeaders(ctx)(O.some(result.remainingPoints), O.some(result.msBeforeNext))
    }),
    TE.mapLeft(error => {
      const { remaining, msBeforeNext, ...realError } = error

      ctx.status = HttpStatus.TOO_MANY_REQUESTS
      setRateLimitXHeaders(ctx)(remaining, msBeforeNext)

      return realError
    }),
  )

export const rateLimitingMiddleware = (
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<unknown | undefined>) => string,
) => createMiddlewareTE(createRateLimiter(limiter, getKey))
