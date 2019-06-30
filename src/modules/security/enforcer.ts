import { promisify } from 'util'
import * as t from 'io-ts'
import { Either, left, right, tryCatch2v } from 'fp-ts/lib/Either'
import { log } from 'fp-ts/lib/Console'
import { verify } from 'jsonwebtoken'
import { IO } from 'fp-ts/lib/IO'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither, fromEither, right as rightTaskEither } from 'fp-ts/lib/TaskEither'
import { flatten } from 'fp-ts/lib/Chain'
import { getEnforcer } from '../rbac'
import { validateRequestBody } from '../validate-request-body-middleware'
import { getSystemLogger } from '../logger'
import { Actions, RolesV, Enforce, Roles } from '../rbac/types'
import { Middleware } from '../../types'
import { getConfig } from '../../config'
import { Error } from '../error/types'

export const enforceWithBodyRoleInternal = (enforcerProvider: () => Promise<Enforce>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
) =>
  validateRequestBody(t.type({ role: RolesV }).decode)(async (ctx, next) => {
    const enforcer = await enforcerProvider()
    const validationResult = await enforcer(ctx.request.body.role, resource, ...actions)
    if (validationResult === true) return await next()

    ctx.status = 401
    getSystemLogger().trace(
      `enforcer failed for role(${ctx.request.body.role}), resource(${resource}, actions(${actions}))`,
    )
  })

const resolveAuthHeader = (headers: unknown): Either<Error, [string, string]> => {
  const invalidAuthError = { code: 'INVALID_AUTH_HEADER' } as const

  const getAuthHeader = (headers: unknown): Either<Error, string> =>
    t
      .type({ authorization: t.string })
      .decode(headers)
      .mapLeft(() => invalidAuthError)
      .map(({ authorization }) => authorization)

  const parseAuthHeaderParts = (parts: string[]): Either<Error, [string, string]> => {
    if (parts.length !== 2) return left(invalidAuthError)
    if (parts[0] !== 'Bearer') return left(invalidAuthError)
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
type Token = t.TypeOf<typeof tokenV>

const verifyAndParseToken = (token: string): Either<Error, Token> => {
  const invalidToken = { code: 'INVALID_TOKEN' }
  return tryCatch2v(() => verify(token, getConfig().server.jwtSecret), () => invalidToken).chain(
    unparsedToken => tokenV.decode(unparsedToken).mapLeft(() => invalidToken),
  )
}

export const enforceWithAuthTokenInternal = (enforcerProvider: () => Promise<Enforce>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
): Middleware<unknown> => async (ctx, next) => {
  const sideEffects = new IO(() =>
    getSystemLogger().trace(
      `enforcer failed for role(foo), resource(${resource}, actions(${actions}))`,
    ),
  )
  const validateRole = (role: Roles) =>
    new TaskEither<Error, boolean>(
      new Task(async () => {
        const enforcer = await enforcerProvider()
        const validationResult = await enforcer(role, resource, ...actions)
        return validationResult === true ? left({ code: 'UNAUTHORIZED' }) : right(true)
      }),
    )

  fromEither(
    resolveAuthHeader(ctx.headers).chain(([, credentials]) => verifyAndParseToken(credentials)),
  ).chain(token => {
    return validateRole(token.role)
  })
  // ).chain(token => {
  //   return rightTaskEither(
  //     validateRole(token.role).fold(
  //       () =>
  //         new IO(async () => {
  //           ctx.status = 200
  //         }),

  //       () =>
  //         new IO(async () => {
  //           ctx.status = 401
  //         }),
  //     ),
  //   )
  // })

  // const b = flatten(a)

  // .map(enforceRole)
  // .chain(
  //   ({ role }) => {
  //     validateRole(role).run()
  //   },
  //   // new Task(() => {
  //   //   const enforcer = await enforcerProvider()
  //   //   const validationResult = await enforcer(role, resource, ...actions)
  //   //   if (validationResult === false) return left({ code: 'UNAUTHORIZED' })

  //   //   // ctx.status = 401
  //   //   // getSystemLogger().trace(
  //   //   //   `enforcer failed for role(${role}), resource(${resource}, actions(${actions}))`,
  //   //   // )
  //   //   // return await next()
  //   // }),
  // )
}

export const enforceWithBodyRole = enforceWithBodyRoleInternal(getEnforcer)
