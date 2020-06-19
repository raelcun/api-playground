import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import Router from 'koa-router'

import { TaskV } from '@models/task'
import {
  createErrorResponse,
  createResponseV,
  createSuccessResponse,
} from '@modules/api-core/response'
import { createLimiter, rateLimitingMiddleware } from '@modules/rateLimiter'
import { enforceWithAuthHeader } from '@modules/rbac'
import { withValidatedBody } from '@modules/validateBody'
import { validateResponse } from '@modules/validateResponse'
import { createTaskService } from '@root/services/task'

const router = new Router()

router.post(
  '/task',
  rateLimitingMiddleware(createLimiter('addTask'), ctx => ctx.ip),
  enforceWithAuthHeader('task', ['add']),
  withValidatedBody(TaskV)(async ctx => {
    await pipe(
      createTaskService().addTask(ctx.request.body),
      TE.map(() => {
        ctx.status = 200
        ctx.body = createSuccessResponse({})
      }),
      TE.mapLeft(err => {
        ctx.status = 500
        ctx.body = createErrorResponse(err)
      }),
    )()
  }),
  validateResponse(createResponseV(t.type({}))),
)

router.delete(
  '/task',
  rateLimitingMiddleware(createLimiter('removeTask'), ctx => ctx.ip),
  enforceWithAuthHeader('task', ['remove']),
  withValidatedBody(t.type({ id: t.string }))(async ctx => {
    await pipe(
      createTaskService().removeTask(ctx.request.body.id),
      TE.map(() => {
        ctx.status = 200
        ctx.body = createSuccessResponse({})
      }),
      TE.mapLeft(err => {
        ctx.status = 500
        ctx.body = createErrorResponse(err)
      }),
    )()
  }),
  validateResponse(createResponseV(t.type({}))),
)

export { router }
