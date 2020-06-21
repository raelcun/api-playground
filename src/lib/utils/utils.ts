import { array as A, either as E, io as IO, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { reporter } from 'io-ts-reporters'
import { Context, Middleware } from 'koa'

import { Err } from '@lib/error'

export const tryCatchTE: typeof TE.tryCatch = (f, onRejected) =>
  TE.tryCatch(() => {
    try {
      return f()
    } catch (err) {
      return Promise.reject(err)
    }
  }, onRejected)
tryCatchTE.call
export const createVoidTE = <L>() => TE.rightTask<L, void>(async () => {})

export const filterObjectKeys = <T extends Record<string, unknown>, K extends keyof T>(
  o: T,
  keys: K[],
): Pick<T, K> => {
  const res: any = {}

  keys.forEach(key => {
    res[key] = o[key]
  })

  return res
}

export const mapErrorCode = <T extends string>(newErrorCode: T) =>
  E.mapLeft((originalError: Err<string>) => ({
    ...originalError,
    code: newErrorCode,
    subcode: originalError.code,
  }))

export const decode = <T>(
  t: t.Type<T, unknown>,
  v: unknown,
): E.Either<Err<'VALIDATION_ERROR'>, T> =>
  pipe(
    t.decode(v),
    E.mapLeft(errors => ({
      code: 'VALIDATION_ERROR',
      message: reporter(E.left(errors)).join('. '),
    })),
  )

export const ioSequence = A.array.sequence(IO.io)

export const DateFromString = new t.Type<Date, string, unknown>(
  'DateFromString',
  (u): u is Date => u instanceof Date,
  (u, c) =>
    pipe(
      t.union([t.string, t.number]).validate(u, c),
      E.chain(s => {
        const d = new Date(s)
        return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d)
      }),
    ),
  a => a.toISOString(),
)

export const createMiddlewareTE = <T>(
  f: (ctx: Context) => TE.TaskEither<unknown, unknown>,
): Middleware<T> => async (ctx, next) => {
  await pipe(
    f(ctx),
    TE.chain(() => TE.rightTask(next)),
  )()
}

export const createMiddlewareE = <T>(
  f: (ctx: Context) => E.Either<unknown, unknown>,
): Middleware<T> => createMiddlewareTE(ctx => TE.fromEither(f(ctx)))
