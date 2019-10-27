import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'
import { Error } from '../error/types'

export const enum Roles {
  User = 'user',
  Admin = 'admin',
}
export const RolesV = t.union([t.literal(Roles.User), t.literal(Roles.Admin)])

export interface Actions {
  account: 'viewAny' | 'viewOwn' | 'editOwn' | 'editAny'
}

export type Enforce = <T extends keyof Actions, U extends Actions[T]>(
  subject: string,
  resource: string,
  ...actions: string[]
) => TE.TaskEither<Error, boolean>
