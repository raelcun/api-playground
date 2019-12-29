import { ResourceType } from './resource'
import { Tag } from './tag'
import { Task } from './task'
import { User } from './user'

export const tags: Tag[] = [
  {
    id: 'tag1',
    resourceType: ResourceType.Tag,
    name: 'Tag 1',
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
  },
  {
    id: 'tag2',
    resourceType: ResourceType.Tag,
    name: 'Tag 2',
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
  },
]

export const users: User[] = [
  {
    id: 'user1',
    resourceType: ResourceType.User,
    name: 'User 1',
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
  },
  {
    id: 'user2',
    resourceType: ResourceType.User,
    name: 'User 2',
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
  },
]

export const tasks: Task[] = [
  {
    id: 'task1',
    resourceType: ResourceType.Task,
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
    name: 'Task 1',
    assignee: users[0].id,
    completed: false,
    dependencies: [],
    dependents: [],
    tags: [tags[0].id],
  },
  {
    id: 'task2',
    resourceType: ResourceType.Task,
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
    name: 'Task 2',
    assignee: users[1].id,
    completed: true,
    dependencies: [],
    dependents: [],
    tags: [],
  },
  {
    id: 'task3',
    resourceType: ResourceType.Task,
    createdAt: new Date('2019-04-21T02:21:07.230Z'),
    name: 'Task 3',
    completed: false,
    dependencies: [],
    dependents: [],
    tags: [tags[0].id, tags[1].id],
  },
]
tasks[0].dependents = [tasks[1].id, tasks[2].id]
tasks[1].dependencies = [tasks[0].id]
tasks[2].dependencies = [tasks[0].id]
