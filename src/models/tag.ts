import * as t from 'io-ts'
import { ResourceV } from './resource'

export const TagV = t.intersection([
  ResourceV,
  t.type({ resourceType: t.literal('tag'), name: t.string }),
])
export type Tag = t.TypeOf<typeof TagV>
