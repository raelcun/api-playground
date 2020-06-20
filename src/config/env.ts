import { either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { getEmergencyLogger } from '@modules/emergencyLogger'
import { Err } from '@modules/error/types'
import { decode } from '@modules/utils'

import { EnvVars, envVarsV } from './types'

export const getEnvVars = (): E.Either<Err, EnvVars> =>
  pipe(
    decode(envVarsV, {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET || '',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    }),
    E.mapLeft(error => {
      getEmergencyLogger().fatal('environment variable validation failed. ' + error.message)
      return { code: 'ENV_VALIDATION_FAILED', subCode: error.code, message: error.message }
    }),
  )
