import { either as E, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import { Middleware } from 'koa'

import { getConfig } from '@config'
import { ConfigProvider } from '@config/types'
import { Err } from '@modules/error/types'
import { createMiddlewareTE } from '@utils'

import { enforceRole, getEnforcer } from '../../enforcer'
import { Actions, EnforceProvider } from '../../types'
import { resolveAuthHeader, verifyAndParseToken } from './parseAuthHeader'

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

export const enforceWithAuthHeaderMiddleware = (enforceProvider: EnforceProvider) => (
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

export const enforceWithAuthHeader = enforceWithAuthHeaderMiddleware(getEnforcer)(getConfig)
