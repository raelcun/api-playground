import t from 'io-ts'
import HttpStatus from 'http-status-codes'
import { reporter } from 'io-ts-reporters'
import { left } from 'fp-ts/lib/Either'
import { getSystemLogger } from '../logger'
import { Middleware } from '../../types'

export const withValidatedBody = <T>(type: t.Type<T, unknown>) => (
  middleware: Middleware<T>,
): Middleware<T> => async (ctx, next) => {
  await type.decode(ctx.request.body).fold(
    async errors => {
      ctx.status = HttpStatus.BAD_REQUEST
      ctx.body = {
        errors: reporter(left(errors)),
      }
      getSystemLogger().trace(ctx.body, `body validation failed for ${ctx.url}`)
    },
    async validatedBody => {
      ctx.request.body = validatedBody
      await middleware(ctx, next)
    },
  )
}
