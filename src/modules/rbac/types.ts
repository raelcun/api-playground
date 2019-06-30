import * as t from 'io-ts'

export const enum Roles {
  User = 'user',
  Admin = 'admin',
}
export const RolesV = t.union([t.literal(Roles.User), t.literal(Roles.Admin)])

export interface Actions {
  account: 'viewAny' | 'viewOwn' | 'editOwn' | 'editAny'
}

export type Enforce = <T extends keyof Actions, U extends Actions[T]>(
  subject: Roles,
  resource: T,
  ...actions: U[]
) => Promise<boolean>
