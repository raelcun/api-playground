import { either as E, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { Err } from 'modules/error/types'
import { ConfigProvider } from 'configuration/types'
import { Middleware } from 'koa'
import HttpStatus from 'http-status-codes'
import { getConfig } from 'configuration'
import { EnforceProvider, Actions } from '../../types'
import { enforceRole, getEnforcer } from '../../enforcer'
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
) => <T extends keyof Actions, U extends Actions[T]>(
  resource: T,
  actions: U[],
): Middleware => async (ctx, next) => {
  await pipe(
    enforceWithAuthHeaderInternal(enforceProvider)(configProvider)(resource, actions)(ctx.headers),
    TE.mapLeft(() => {
      ctx.status = HttpStatus.UNAUTHORIZED
    }),
    TE.chain(() => TE.rightTask(next)),
  )()
}

export const enforceWithAuthHeader = enforceWithAuthHeaderMiddleware(getEnforcer)(getConfig)
