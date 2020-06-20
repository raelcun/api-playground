import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import HttpStatus from 'http-status-codes'
import * as t from 'io-ts'
import { Middleware } from 'koa'

import { validateBody } from '@lib/body-validator'
import { Err } from '@lib/error'
import { LoggerFactory } from '@lib/logger'
import { Actions, EnforceProvider, enforceRole, RolesV } from '@lib/rbac'
import { createMiddlewareTE } from '@lib/utils'

const enforceWithBodyRoleInternal = (createLogger: LoggerFactory) => (
  enforceFnProvider: EnforceProvider,
) => <T extends keyof Actions, U extends Actions[T]>(resource: T, actions: U[]) => (
  body: unknown,
): TE.TaskEither<Err, void> =>
  pipe(
    validateBody(createLogger)(t.type({ role: RolesV }))(body),
    TE.fromEither,
    TE.chain(({ role }) => enforceRole(enforceFnProvider)(resource)(actions)(role)),
  )

export const enforceWithBodyRoleMiddleware = (createLogger: LoggerFactory) => (
  enforceProvider: EnforceProvider,
) => <T extends keyof Actions, U extends Actions[T]>(resource: T, actions: U[]): Middleware =>
  createMiddlewareTE(ctx =>
    pipe(
      enforceWithBodyRoleInternal(createLogger)(enforceProvider)(resource, actions)(
        ctx.request.body,
      ),
      TE.mapLeft(() => {
        ctx.status = HttpStatus.UNAUTHORIZED
      }),
    ),
  )
