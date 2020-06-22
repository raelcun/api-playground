import { sign } from 'jsonwebtoken'

import { Roles } from '@lib/rbac'
import { Token } from '@modules/api-core'
import { getConfig } from '@modules/config'

const JWT_SECRET = getConfig().server.jwtSecret

export const createExpiredTokenHeader = () =>
  `Bearer ${sign(<Token>{ userId: 'foo', role: Roles.User }, JWT_SECRET, {
    expiresIn: '-10s',
  })}`

export const createInvalidTokenSchemaHeader = () => `Bearer ${sign({ userId: 'foo' }, JWT_SECRET)}`

export const createValidUserTokenHeader = () =>
  `Bearer ${sign(<Token>{ userId: 'foo', role: Roles.User }, JWT_SECRET)}`

export const createValidAdminTokenHeader = () =>
  `Bearer ${sign(<Token>{ userId: 'foo', role: Roles.Admin }, JWT_SECRET)}`
