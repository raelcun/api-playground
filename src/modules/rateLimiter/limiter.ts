import { option as O, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import {
  RateLimiterAbstract,
  RateLimiterMemory,
  RateLimiterRes,
  RLWrapperBlackAndWhite,
} from 'rate-limiter-flexible'

import { Err } from '@modules/error/types'
import { KoaContext } from '@root/types'

type LimiterConsumeError = Err & { remaining: O.Option<number>; msBeforeNext: O.Option<number> }

const getRateLimiterError = (e: any): LimiterConsumeError => {
  return {
    code: 'LIMITER_CONSUME_FAILED',
    remaining: O.fromNullable(e.remainingPoints),
    msBeforeNext: O.fromNullable(e.msBeforeNext),
  }
}

const limiterConsume = (
  limiter: RateLimiterAbstract,
  key: string,
): TE.TaskEither<LimiterConsumeError, RateLimiterRes> =>
  TE.tryCatch(() => limiter.consume(key), getRateLimiterError)

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

export const createRateLimiter = (
  limiter: RateLimiterAbstract,
  getKey: (ctx: KoaContext<any>) => string,
) => <T>(ctx: KoaContext<T>): TE.TaskEither<Err, KoaContext<T>> =>
  pipe(
    limiterConsume(limiter, getKey(ctx)),
    TE.map(result =>
      setRateLimitXHeaders(O.some(result.remainingPoints), O.some(result.msBeforeNext))(ctx),
    ),
    TE.mapLeft(error => {
      const { remaining, msBeforeNext, ...realError } = error
      ctx.status = HttpStatus.TOO_MANY_REQUESTS
      setRateLimitXHeaders(remaining, msBeforeNext)(ctx)
      return realError
    }),
  )

export const createLimiter = (
  keyPrefix: string,
  points = 100,
  duration = 10,
): RateLimiterAbstract =>
  new RLWrapperBlackAndWhite({
    limiter: new RateLimiterMemory({
      keyPrefix,
      points,
      duration,
    }),
    whiteList: ['127.0.0.1', '::ffff:127.0.0.1', '::1'],
  })
