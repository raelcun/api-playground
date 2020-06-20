import { getEnforcer } from '@lib/rbac'
import { createEnforceWithAuthHeaderMiddleware } from '@lib/rbac-middleware'
import { getConfig } from '@modules/config'

export const enforceWithAuthHeader = createEnforceWithAuthHeaderMiddleware(getEnforcer)(
  () => getConfig().server,
)
