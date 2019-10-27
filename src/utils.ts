import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { task as T, taskEither as TE, either as E } from 'fp-ts'
import createMockContext, { Options } from '@shopify/jest-koa-mocks/dist/create-mock-context'
import { KoaContext } from './types'
import { Err } from './modules/error/types'

export const createKoaContext = <T>(
  options?: Options<object, T> & { requestBody: T },
): KoaContext<T> => {
  return createMockContext(options) as KoaContext<T>
}

export const createMockNext = () => jest.fn(() => Promise.resolve())

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

export const createMiddlewareE = <T>(f: (ctx: KoaContext<T>) => E.Either<Err, KoaContext<T>>) => (
  ctx: KoaContext<T>,
  next: () => Promise<void>,
) =>
  pipe(
    f(ctx),
    TE.fromEither,
    TE.map(next),
  )

export const createMiddlewareTE = <T>(
  f: (ctx: KoaContext<T>) => TE.TaskEither<Err, KoaContext<T>>,
) => (ctx: KoaContext<T>, next: () => Promise<void>) =>
  pipe(
    f(ctx),
    TE.chain(() => TE.rightTask(next)),
  )
