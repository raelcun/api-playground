import { tryCatch2v, Either, left, right } from 'fp-ts/lib/Either'
import { verify } from 'jsonwebtoken'
import * as t from 'io-ts'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither'
import { IO } from 'fp-ts/lib/IO'
import { getConfig } from '../../config'
import { Actions, RolesV, Roles, Enforce } from '../rbac/types'
import { Error } from '../error/types'
import { Middleware } from '../../types'
import { getEnforcer } from '../rbac'
import { getSystemLogger } from '../logger'

const resolveAuthHeader = (headers: unknown): Either<Error, [string, string]> => {
  const getAuthHeader = (headers: unknown): Either<Error, string> =>
    t
      .type({ authorization: t.string })
      .decode(headers)
      .mapLeft(() => ({ code: 'INVALID_AUTH_HEADER', message: 'invalid auth header format' }))
      .map(({ authorization }) => authorization)

  const parseAuthHeaderParts = (parts: string[]): Either<Error, [string, string]> => {
    if (parts.length !== 2)
      return left({ code: 'INVALID_AUTH_HEADER', message: 'requires two parts' })
    if (parts[0] !== 'Bearer')
      return left({ code: 'INVALID_AUTH_HEADER', message: 'first part must be "Bearer"' })
    return right([parts[0], parts[1]])
  }

  return getAuthHeader(headers)
    .map(authorization => authorization.split(' '))
    .chain(parseAuthHeaderParts)
}

const tokenV = t.type({
  userId: t.string,
  role: RolesV,
})
export type Token = t.TypeOf<typeof tokenV>

const verifyAndParseToken = (token: string): Either<Error, Token> => {
  return tryCatch2v(
    () => verify(token, getConfig().server.jwtSecret),
    () => ({ code: 'INVALID_TOKEN', message: 'failed to decode token' }),
  ).chain(tokenPayload =>
    tokenV
      .decode(tokenPayload)
      .mapLeft(() => ({ code: 'INVALID_TOKEN', message: 'token payload format invalid' })),
  )
}

export const enforceWithAuthHeaderInternal = (enforcerProvider: () => Promise<Enforce>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
): Middleware<unknown> => async (ctx, next) => {
  const validateRoleWithEnforcer = (role: Roles): TaskEither<Error, undefined> =>
    new TaskEither(
      new Task(async () => {
        try {
          const enforcer = await enforcerProvider()
          const validationResult = await enforcer(role, resource, ...actions)
          return validationResult === false ? left({ code: 'UNAUTHORIZED' }) : right(undefined)
        } catch (e) {
          return left({ code: 'AUTHORIZATION_FAILED' })
        }
      }),
    )
  const onUnauthorized = () =>
    new IO(async () => {
      ctx.status = 401
      ctx.body = 'bad'
    })
  const onAuthorized = () =>
    new IO(async () => {
      await next()
    })

  const sideEffects = await fromEither(
    resolveAuthHeader(ctx.headers).chain(([, credentials]) => verifyAndParseToken(credentials)),
  )
    .chain(token => validateRoleWithEnforcer(token.role))
    .mapLeft(e => {
      getSystemLogger().trace(e)
      return e
    })
    .fold(onUnauthorized, onAuthorized)
    .run()
  await sideEffects.run()
}

export const enforceWithAuthHeader = enforceWithAuthHeaderInternal(getEnforcer)
