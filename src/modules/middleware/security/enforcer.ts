import * as t from 'io-ts'
import { getEnforcer } from '../../rbac'
import { withValidatedBody } from '../../with-validated-body'
import { getSystemLogger } from '../../logger'
import { Actions, RolesV, Enforce } from '../../rbac/types'

export const enforceWithBodyRoleInternal = (enforcerProvider: () => Promise<Enforce>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
) =>
  withValidatedBody(t.type({ role: RolesV }))(async (ctx, next) => {
    const enforcer = await enforcerProvider()
    const validationResult = await enforcer(ctx.request.body.role, resource, ...actions)
    if (validationResult === true) return await next()

    ctx.status = 401
    getSystemLogger().trace(
      `enforcer failed for role(${ctx.request.body.role}), resource(${resource}, actions(${actions}))`,
    )
  })

export const enforceWithBodyRole = enforceWithBodyRoleInternal(getEnforcer)