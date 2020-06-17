import { DocumentClient, PutItemInput } from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk/lib/error'
import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { tryCatch } from 'fp-ts/lib/TaskEither'
import { ContextReplacementPlugin } from 'webpack'

import { Task } from '@models/task'
import { DynamoClient, getDynamoClient } from '@modules/dynamo-client'
import { Err } from '@modules/error/types'

import { TaskService } from './types'

const addTaskInternal = (taskClient: DynamoClient<Task>): TaskService['addTask'] => newTask =>
  pipe(
    taskClient.put({
      TableName: 'tasks',
      Item: newTask,
    }),
    TE.map(() => true),
  )

const removeTaskInternal = (taskClient: DynamoClient<Task>): TaskService['removeTask'] => taskId =>
  pipe(
    taskClient.delete({
      TableName: 'tasks',
      Key: {
        id: {
          S: taskId,
        },
      },
    }),
    TE.map(() => true),
  )

// export const service: TaskService = {
//   addTask,
//   removeTask,
//   editTask,
//   getTask,
//   getAllTasks,
// }
