import * as t from 'io-ts'

export const SubjectV = t.union([t.literal('user'), t.literal('admin')])
export type Subject = t.TypeOf<typeof SubjectV>

export interface Actions {
  account: 'viewAny' | 'viewOwn' | 'editOwn' | 'editAny'
}

export type Enforce = <T extends keyof Actions, U extends Actions[T]>(
  subject: Subject,
  resource: T,
  ...actions: U[]
) => Promise<boolean>
