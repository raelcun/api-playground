import { left, right } from 'fp-ts/lib/TaskEither'

import { mockData } from '@models/index'

import { MockTaskService } from './types'

let tasks = mockData.tasks

const addTask: MockTaskService['addTask'] = newTask => {
  tasks = [...tasks, newTask]
  return right(true)
}

const removeTask: MockTaskService['removeTask'] = taskId => {
  tasks = tasks.filter(e => e.id !== taskId)
  return right(true)
}

const editTask: MockTaskService['editTask'] = (taskId, newTask) => {
  const taskIndex = tasks.findIndex(e => e.id === taskId)
  if (taskIndex < 0) return left({ code: 'TASK_NOT_FOUND' })
  tasks[taskIndex] = { ...newTask, id: taskId }
  return right(true)
}

const getTask: MockTaskService['getTask'] = taskId => {
  const foundTask = tasks.find(e => e.id === taskId)
  if (foundTask === undefined) return left({ code: 'TASK_NOT_FOUND' })
  return right(foundTask)
}

const getAllTasks: MockTaskService['getAllTasks'] = () => {
  return right(tasks)
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
