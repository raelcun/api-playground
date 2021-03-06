import { taskEither as TE } from 'fp-ts'
import * as t from 'io-ts'

import { Err } from '@lib/error'

export const enum Roles {
  User = 'user',
  Admin = 'admin',
}
export const RolesV = t.union([t.literal(Roles.User), t.literal(Roles.Admin)])

export interface Actions {
  adminMessage: 'post'
  task: 'add' | 'remove' | 'edit' | 'get'
}

export type Enforce = <T extends keyof Actions, U extends Actions[T]>(
  subject: string,
  resource: T,
  ...actions: U[]
) => TE.TaskEither<Err, boolean>

export type EnforceProvider = TE.TaskEither<Err, Enforce>
