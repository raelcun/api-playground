import * as t from 'io-ts'

import { DateFromString } from '@utils'

export const ResourceIdV = t.string

export const enum ResourceType {
  Task = 'task',
  Tag = 'tag',
  User = 'user',
}
export const ResourceTypeV = t.union([
  t.literal(ResourceType.Task),
  t.literal(ResourceType.Tag),
  t.literal(ResourceType.User),
])

export const ResourceV = t.type({
  id: ResourceIdV,
  resourceType: ResourceTypeV,
  createdAt: DateFromString,
})
export type Resource = t.TypeOf<typeof ResourceV>
