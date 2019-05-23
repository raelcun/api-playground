import * as t from 'io-ts'
import { DateFromString } from '../utils'

export const ResourceIdV = t.string

export const ResourceTypeV = t.union([t.literal('task'), t.literal('tag'), t.literal('user')])
export type ResourceType = t.TypeOf<typeof ResourceIdV>

export const ResourceV = t.type({
  id: ResourceIdV,
  resourceType: ResourceTypeV,
  createdAt: DateFromString,
})
export type Resource = t.TypeOf<typeof ResourceV>
