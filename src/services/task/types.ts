import { TaskEither } from 'fp-ts/lib/TaskEither'

import { Task } from '@models/index'
import { Err } from '@modules/error/types'

export type AddTaskError = Err
export type RemoveTaskError = Err
export type GetTaskError = Err | { code: 'TASK_NOT_FOUND' }
export type GetAllTasksError = Err
export type EditTaskError = Err | { code: 'TASK_NOT_FOUND' }

export interface TaskService {
  addTask: (newTask: Task) => TaskEither<AddTaskError, true>
  removeTask: (taskId: string) => TaskEither<RemoveTaskError, true>
  editTask: (
    taskId: string,
    newTask: Pick<Task, Exclude<keyof Task, 'id'>>,
  ) => TaskEither<EditTaskError, true>
  getTask: (taskId: string) => TaskEither<GetTaskError, Task>
  getAllTasks: () => TaskEither<GetAllTasksError, Task[]>
}

export interface MockTaskService extends TaskService {
  resetMocks: () => void
}
