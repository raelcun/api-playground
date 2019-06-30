import * as t from 'io-ts'
import { DateFromString } from '../utils'
import { ResourceV, ResourceIdV, ResourceType } from './resource'

export const TaskV = t.intersection([
  ResourceV,
  t.type({
    resourceType: t.literal(ResourceType.Task),
    name: t.string,
    completed: t.boolean,
    dependencies: t.array(ResourceIdV),
    dependents: t.array(ResourceIdV),
    tags: t.array(ResourceIdV),
  }),
  t.partial({
    assignee: ResourceIdV,
    completedAt: t.number,
    dueAt: DateFromString,
    notes: t.string,
    parent: ResourceIdV,
  }),
])
export type Task = t.TypeOf<typeof TaskV>
