import { TaskEither } from 'fp-ts/lib/TaskEither'

import { Task } from '@models/index'
import { RequestError } from '@modules/httpClient/types'

export type AddTaskError = RequestError
export type RemoveTaskError = RequestError
export type GetTaskError = RequestError | { code: 'TASK_NOT_FOUND' }
export type GetAllTasksError = RequestError
export type EditTaskError = RequestError | { code: 'TASK_NOT_FOUND' }

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
