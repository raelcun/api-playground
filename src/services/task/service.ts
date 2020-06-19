import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { Task } from '@models/task'
import { DynamoClient, getDynamoClient } from '@modules/dynamo-client'
import { getSystemLogger } from '@modules/logger'

import { TaskService } from './types'

const addTaskInternal = (taskClient: DynamoClient<Task>): TaskService['addTask'] => newTask =>
  pipe(
    taskClient.put({
      TableName: 'tasks',
      Item: newTask,
    }),
    TE.map(() => true),
  )

const removeTaskInternal = (
  taskClient: DynamoClient<Task>,
): TaskService['removeTask'] => taskId => {
  getSystemLogger().debug('removing task ' + taskId)
  return pipe(
    taskClient.delete({
      TableName: 'tasks',
      Key: {
        id: taskId,
      },
    }),
    TE.map(() => true),
  )
}

const editTaskInternal = (taskClient: DynamoClient<Task>): TaskService['editTask'] => (
  taskId,
  newTask,
) => TE.left({ code: 'NOT_IMPLEMENTED' })

const getTaskInternal = (taskClient: DynamoClient<Task>): TaskService['getTask'] => taskId =>
  TE.left({ code: 'NOT_IMPLEMENTED' })

const getAllTasksInternal = (taskClient: DynamoClient<Task>): TaskService['getAllTasks'] => () =>
  TE.left({ code: 'NOT_IMPLEMENTED' })

export const createTaskService = (): TaskService => ({
  addTask: addTaskInternal(getDynamoClient()),
  removeTask: removeTaskInternal(getDynamoClient()),
  editTask: editTaskInternal(getDynamoClient()),
  getTask: getTaskInternal(getDynamoClient()),
  getAllTasks: getAllTasksInternal(getDynamoClient()),
})
