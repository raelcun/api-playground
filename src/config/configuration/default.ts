import { either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { getEnvVars } from '@config/env'
import { Err } from '@modules/error/types'

import { FullConfig } from '../types'

export default (): E.Either<Err, FullConfig> =>
  pipe(
    getEnvVars(),
    E.map(envVars => ({
      isProduction: envVars.NODE_ENV === 'production',
      env: envVars.NODE_ENV,
      server: {
        jwtSecret: '9m02fgRYt77vPV6qSa5uigFhml0AgDsqyeMAAWtFah1KBZ8SjLK8CVD2e5QrCkMl',
        securePort: 4443,
        insecurePort: 4080,
        enableSSL: true,
      },
      logging: {
        prettyPrint: false,
        level: 'info',
      },
      aws: {
        region: 'us-east-2',
        credentials: {
          accessKeyId: envVars.AWS_ACCESS_KEY_ID,
          secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
        },
      },
    })),
  )
