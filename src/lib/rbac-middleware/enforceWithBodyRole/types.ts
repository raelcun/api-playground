import * as t from 'io-ts'

import { RolesV } from '@lib/rbac'

export const tokenV = t.type({
  userId: t.string,
  role: RolesV,
})
export type Token = t.TypeOf<typeof tokenV>
