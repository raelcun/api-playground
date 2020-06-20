import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import Router from 'koa-router'

import { createLimiter } from '@lib/rate-limiter'
import { TaskV } from '@models/task'
import { createErrorResponse, createResponseV, createSuccessResponse } from '@modules/api-core'
import { withValidatedBody } from '@modules/body-validator-middleware'
import { rateLimitingMiddleware } from '@modules/rate-limiter-middleware'
import { enforceWithAuthHeader } from '@modules/rbac-middleware'
import { validateResponse } from '@modules/response-validator-middleware'
import { createTaskService } from '@services/task'

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
