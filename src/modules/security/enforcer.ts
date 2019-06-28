import * as t from 'io-ts'
import { APIEnforcer } from '../rbac/enforcer'
import { Actions, SubjectV, getEnforcer } from '../rbac'
import { validateRequestBody } from '../validate-request-body-middleware'
import { getSystemLogger } from '../logger'

export const enforceWithBodyRoleInternal = (enforcerProvider: () => Promise<APIEnforcer>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
  actions: U[],
) =>
  validateRequestBody(t.type({ role: SubjectV }).decode)(async (ctx, next) => {
    const enforcer = await enforcerProvider()
    if (enforcer.enforce(ctx.request.body.role, resource, ...actions)) return await next()
    ctx.status = 401
    getSystemLogger().trace(
      `enforcer failed for role(${ctx.request.body.role}), resource(${resource}, actions(${actions}))`,
    )
  })

export const enforceWithBodyRole = enforceWithBodyRoleInternal(getEnforcer)
