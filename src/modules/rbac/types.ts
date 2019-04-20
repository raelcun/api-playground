import * as t from 'io-ts'

export const SubjectV = t.union([t.literal('user'), t.literal('admin')])
export type Subject = t.TypeOf<typeof SubjectV>

export interface Actions {
  account: 'viewAny' | 'viewOwn' | 'editOwn' | 'editAny'
}
