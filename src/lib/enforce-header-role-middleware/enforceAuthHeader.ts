import { either as E, taskEither as TE } from 'fp-ts'
import { flow } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import * as t from 'io-ts'
import { Middleware } from 'koa'

import { Err } from '@lib/error'
import { logErrorsTE, LoggerProvider } from '@lib/logger'
import { Actions, EnforceProvider, enforceRole, Roles } from '@lib/rbac'
import { createMiddlewareTE } from '@lib/utils'

import { resolveAuthHeader, verifyAndParseToken } from './parseAuthHeader'
import { ConfigProvider } from './types'

const enforceWithAuthHeaderInternal = <T>(
  enforceProvider: EnforceProvider,
  configProvider: ConfigProvider,
  tokenV: t.Type<T, unknown>,
  getRole: (token: T) => Roles,
) => <T extends keyof Actions, U extends Actions[T]>(resource: T, actions: U[]) => (
  headers: unknown,
): TE.TaskEither<Err, void> =>
  pipe(
    resolveAuthHeader(headers),
    flow(E.chain(verifyAndParseToken(configProvider, tokenV)), TE.fromEither),
    TE.chain(token => enforceRole(enforceProvider)(resource)(actions)(getRole(token))),
  )

export const createEnforceWithAuthHeaderMiddleware = <T>(
  enforceProvider: EnforceProvider,
  configProvider: ConfigProvider,
  getLogger: LoggerProvider,
  tokenV: t.Type<T, unknown>,
  getRole: (token: T) => Roles,
) => <T extends keyof Actions, U extends Actions[T]>(resource: T, actions: U[]): Middleware =>
  createMiddlewareTE(ctx =>
    pipe(
      enforceWithAuthHeaderInternal(
        enforceProvider,
        configProvider,
        tokenV,
        getRole,
      )(
        resource,
        actions,
      )(ctx.headers),
      logErrorsTE(getLogger(), 'error'),
      TE.mapLeft(() => {
        ctx.status = HttpStatus.UNAUTHORIZED
      }),
    ),
  )
