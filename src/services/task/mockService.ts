import { right, left } from 'fp-ts/lib/TaskEither'
import { task } from 'fp-ts/lib/Task'
import { mockData } from '../../models'
import { MockTaskService } from './types'

let tasks = mockData.tasks

const addTask: MockTaskService['addTask'] = newTask => {
  tasks = [...tasks, newTask]
  return right(task.of(true))
}

const removeTask: MockTaskService['removeTask'] = taskId => {
  tasks = tasks.filter(e => e.id !== taskId)
  return right(task.of(true))
}

const editTask: MockTaskService['editTask'] = (taskId, newTask) => {
  const taskIndex = tasks.findIndex(e => e.id === taskId)
  if (taskIndex < 0) return left(task.of({ code: 'TASK_NOT_FOUND' }))
  tasks[taskIndex] = { ...newTask, id: taskId }
  return right(task.of(true))
}

const getTask: MockTaskService['getTask'] = taskId => {
  const foundTask = tasks.find(e => e.id === taskId)
  if (foundTask === undefined) return left(task.of({ code: 'TASK_NOT_FOUND' }))
  return right(task.of(foundTask))
}

const getAllTasks: MockTaskService['getAllTasks'] = () => {
  return right(task.of(tasks))
}

export const service: MockTaskService = {
  addTask,
  removeTask,
  editTask,
  getTask,
  getAllTasks,
  resetMock: () => (tasks = mockData.tasks),
}
