import * as t from 'io-ts'
import { taskEither as TE } from 'fp-ts'
import { Err } from '@modules/error/types'

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
  resource: T,
  ...actions: U[]
) => TE.TaskEither<Err, boolean>

export type EnforceProvider = TE.TaskEither<Err, Enforce>
