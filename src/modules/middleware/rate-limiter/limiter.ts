import { option as O, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import { RateLimiterAbstract } from 'rate-limiter-flexible'
import { KoaContext } from '../../../types'
import { Err } from '../../error/types'

const limiterConsume = (limiter: RateLimiterAbstract)

const setRateLimitXHeaders = (remaining: O.Option<number>, msBeforeNext: O.Option<number>) => <T>(
  ctx: KoaContext<T>,
): KoaContext<T> => {
  if (O.isSome(remaining)) {
    ctx.set('X-RateLimit-Remaining', remaining.value.toString())
  }
  if (O.isSome(msBeforeNext)) {
    ctx.set('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext.value).toISOString())
  }
  return ctx
}

type RateLimiterError = Err & { remaining: O.Option<number>; msBeforeNext: O.Option<number> }

const getRateLimiterError = (e: any): RateLimiterError => {
  return {
    code: 'LIMITER_CONSUME_FAILED',
    remaining: O.fromNullable(e.remainingPoints),
    msBeforeNext: O.fromNullable(e.msBeforeNext),
  }
}

export const createRateLimiter = (
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<any>) => string,
) => <T>(ctx: KoaContext<T>): TE.TaskEither<Err, KoaContext<T>> =>
  pipe(
    TE.tryCatch(() => limiter.consume(getKey(ctx)), getRateLimiterError),
    TE.map(result =>
      setRateLimitXHeaders(O.some(result.remainingPoints), O.some(result.remainingPoints))(ctx),
    ),
    TE.mapLeft(error => {
      const { remaining, msBeforeNext, ...realError } = error
      ctx.status = HttpStatus.TOO_MANY_REQUESTS
      setRateLimitXHeaders(remaining, msBeforeNext)(ctx)
      return realError
    }),
  )
