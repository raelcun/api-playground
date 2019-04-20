import t from 'io-ts'
import HttpStatus from 'http-status-codes'
import { reporter } from 'io-ts-reporters'
import { left } from 'fp-ts/lib/Either'
import { Middleware, KoaContext } from '../middleware'
import { getSystemLogger } from '../logger'

export const validateRequestBody = <T>(decoder: t.Decode<unknown, T>) => (
  middleware: Middleware<T>,
): Middleware<T> => async (ctx, next) => {
  await decoder(ctx.request.body).fold(
    async errors => {
      ctx.status = HttpStatus.BAD_REQUEST
      ctx.body = {
        errors: reporter(left(errors)),
      }
      getSystemLogger().trace(ctx.body, `body validation failed for ${ctx.url}`)
    },
    async validatedBody => {
      ctx.request.body = validatedBody
      await middleware(ctx as KoaContext<T>, next)
    },
  )
}
