import * as t from 'io-ts'
import { ResourceV } from './resource'

export const UserV = t.intersection([
  ResourceV,
  t.type({ resourceType: t.literal('user'), name: t.string }),
])
export type User = t.TypeOf<typeof UserV>
