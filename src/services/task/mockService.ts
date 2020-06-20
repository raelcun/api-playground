import { option as O, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import * as mockData from '@models/mock-data'

import { MockTaskService } from './types'

let tasks = mockData.tasks

const addTask: MockTaskService['addTask'] = newTask => {
  tasks = [...tasks, newTask]
  return TE.right(true)
}

const removeTask: MockTaskService['removeTask'] = taskId => {
  tasks = tasks.filter(e => e.id !== taskId)
  return TE.right(true)
}

const editTask: MockTaskService['editTask'] = (taskId, newTask) => {
  const taskIndex = tasks.findIndex(e => e.id === taskId)
  if (taskIndex < 0) return TE.left({ code: 'TASK_NOT_FOUND' })
  tasks[taskIndex] = { ...newTask, id: taskId }
  return TE.right(true)
}

const getTask: MockTaskService['getTask'] = taskId =>
  pipe(
    O.fromNullable(tasks.find(e => e.id === taskId)),
    O.fold(
      () => TE.left({ code: 'TASK_NOT_FOUND' }),
      task => TE.right(task),
    ),
  )

const getAllTasks: MockTaskService['getAllTasks'] = () => {
  return TE.right(tasks)
}

const resetMocks = () => {
  tasks = mockData.tasks
}

export const service: MockTaskService = {
  addTask,
  removeTask,
  editTask,
  getTask,
  getAllTasks,
  resetMocks,
}
