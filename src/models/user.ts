import * as t from 'io-ts'
import { ResourceV, ResourceType } from './resource'

export const UserV = t.intersection([
  ResourceV,
  t.type({ resourceType: t.literal(ResourceType.User), name: t.string }),
])
export type User = t.TypeOf<typeof UserV>
