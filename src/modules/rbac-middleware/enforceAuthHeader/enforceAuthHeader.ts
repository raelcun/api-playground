import { createEnforceWithAuthHeaderMiddleware } from '@lib/enforce-header-role-middleware'
import { getEnforcer } from '@lib/rbac'
import { tokenV } from '@modules/api-core'
import { getConfig } from '@modules/config'

export const enforceWithAuthHeader = createEnforceWithAuthHeaderMiddleware(
  getEnforcer,
  () => getConfig().server,
  tokenV,
  token => token.role,
)
