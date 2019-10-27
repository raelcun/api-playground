import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import { getEnforcer } from '../../rbac'
import { withValidatedBody } from '../../with-validated-body'
import { getSystemLogger } from '../../logger'
import { Actions, RolesV, Enforce } from '../../rbac/types'
import { Err } from '../../error/types'

export const enforceWithBodyRoleInternal = (enforcerProvider: TE.TaskEither<Err, Enforce>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
) =>
  withValidatedBody(t.type({ role: RolesV }))(async (ctx, next) => {
    await pipe(
      enforcerProvider,
      TE.chain(enforce => enforce(ctx.request.body.role, resource, ...actions)),
      TE.fold(
        () => async () => {
          ctx.status = HttpStatus.UNAUTHORIZED
          getSystemLogger().trace(
            `enforcer failed for role(${ctx.request.body.role}), resource(${resource}, actions(${actions}))`,
          )
        },
        result => async () => {
          if (result === true) {
            await next()
          } else {
            ctx.status = HttpStatus.UNAUTHORIZED
          }
        },
      ),
    )()
  })

export const enforceWithBodyRole = enforceWithBodyRoleInternal(getEnforcer)
