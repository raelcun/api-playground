import * as t from 'io-ts'
import { ResourceV, ResourceType } from './resource'

export const TagV = t.intersection([
  ResourceV,
  t.type({ resourceType: t.literal(ResourceType.Tag), name: t.string }),
])
export type Tag = t.TypeOf<typeof TagV>
