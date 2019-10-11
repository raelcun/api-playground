import * as t from 'io-ts'
import { reporter } from 'io-ts-reporters'
import { left } from 'fp-ts/lib/Either'
import HttpStatus from 'http-status-codes'
import { Middleware } from '../../../types'
import { getSystemLogger } from '../../logger'
import { getConfig } from '../../../config'

export const validateResponseInner = (shouldError: boolean) => <T>(
  type: t.Type<T, unknown>,
): Middleware<T> => async (ctx, next) => {
  type.decode(ctx.body).fold(
    errors => {
      getSystemLogger().warn('failed to validate response\n' + reporter(left(errors)))
      if (shouldError) {
        ctx.status = HttpStatus.INTERNAL_SERVER_ERROR
        ctx.body = {
          errors: reporter(left(errors)),
        }
      } else {
        next()
      }
    },
    () => {
      next()
    },
  )
}

export const validateResponse = validateResponseInner(getConfig().isProduction)
