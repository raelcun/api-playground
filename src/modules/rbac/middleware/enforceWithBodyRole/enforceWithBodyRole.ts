import * as t from 'io-ts'
import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { Middleware } from 'koa'
import HttpStatus from 'http-status-codes'
import { validateBody } from 'modules/validate-body'
import { Err } from 'modules/error/types'
import { Actions, RolesV, EnforceProvider } from '../../types'
import { enforceRole, getEnforcer } from '../../enforcer'

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
): Middleware => async (ctx, next) => {
  await pipe(
    enforceWithBodyRoleInternal(enforceProvider)(resource, actions)(ctx.request.body),
    TE.mapLeft(() => {
      ctx.status = HttpStatus.UNAUTHORIZED
    }),
    TE.chain(() => TE.rightTask(next)),
  )()
}

export const enforceWithBodyRole = enforceWithBodyRoleMiddleware(getEnforcer)