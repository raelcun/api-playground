import { either as E, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import { Middleware } from 'koa'

import { Err } from '@lib/error'
import { Actions, EnforceProvider, enforceRole } from '@lib/rbac'
import { createMiddlewareTE } from '@lib/utils'

import { resolveAuthHeader, verifyAndParseToken } from './parseAuthHeader'
import { ConfigProvider } from './types'

const enforceWithAuthHeaderInternal = (enforceProvider: EnforceProvider) => (
  configProvider: ConfigProvider,
) => <T extends keyof Actions, U extends Actions[T]>(resource: T, actions: U[]) => (
  headers: unknown,
): TE.TaskEither<Err, void> =>
  pipe(
    resolveAuthHeader(headers),
    E.chain(verifyAndParseToken(configProvider)),
    TE.fromEither,
    TE.chain(({ role }) => enforceRole(enforceProvider)(resource)(actions)(role)),
  )

export const createEnforceWithAuthHeaderMiddleware = (enforceProvider: EnforceProvider) => (
  configProvider: ConfigProvider,
) => <T extends keyof Actions, U extends Actions[T]>(resource: T, actions: U[]): Middleware =>
  createMiddlewareTE(ctx =>
    pipe(
      enforceWithAuthHeaderInternal(enforceProvider)(configProvider)(resource, actions)(
        ctx.headers,
      ),
      TE.mapLeft(() => {
        ctx.status = HttpStatus.UNAUTHORIZED
      }),
    ),
  )
