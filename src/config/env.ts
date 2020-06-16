import { either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { getEmergencyLogger } from '@modules/emergencyLogger'
import { Err } from '@modules/error/types'

import { EnvVars, envVarsV } from './types'

export const getEnvVars = (): E.Either<Err, EnvVars> =>
  pipe(
    envVarsV.decode({
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET || '',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    }),
    E.mapLeft(errors => {
      getEmergencyLogger().fatal('environment variable validation failed', errors)
      return { code: 'ENV_VALIDATION_FAILED' }
    }),
  )
