import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import * as t from 'io-ts'
import { Middleware } from 'koa'

import { Err } from '@modules/error/types'
import { validateBody } from '@modules/validateBody'
import { createMiddlewareTE } from '@utils'

import { enforceRole, getEnforcer } from '../../enforcer'
import { Actions, EnforceProvider, RolesV } from '../../types'

const enforceWithBodyRoleInternal = (enforceFnProvider: EnforceProvider) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
) => (body: unknown): TE.TaskEither<Err, void> =>
  pipe(
    validateBody(t.type({ role: RolesV }))(body),
    TE.fromEither,
    TE.chain(({ role }) => enforceRole(enforceFnProvider)(resource)(actions)(role)),
  )

export const enforceWithBodyRoleMiddleware = (enforceProvider: EnforceProvider) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
): Middleware =>
  createMiddlewareTE(ctx =>
    pipe(
      enforceWithBodyRoleInternal(enforceProvider)(resource, actions)(ctx.request.body),
      TE.mapLeft(() => {
        ctx.status = HttpStatus.UNAUTHORIZED
      }),
    ),
  )

export const enforceWithBodyRole = enforceWithBodyRoleMiddleware(getEnforcer)
