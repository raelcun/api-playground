import { getEnforcer } from '@lib/rbac'
import { enforceWithBodyRoleMiddleware } from '@lib/rbac-middleware'
import { getSystemLogger } from '@modules/logger'

export const enforceWithBodyRole = enforceWithBodyRoleMiddleware(getSystemLogger)(getEnforcer)
