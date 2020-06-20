import { either as E } from 'fp-ts'

import { Err } from '@lib/error'

import { FullConfig, PartialConfig } from '../types'

export default (): E.Either<Err, PartialConfig<FullConfig>> =>
  E.right({
    server: {
      securePort: 4443,
      enableSSL: false,
    },
    logging: {
      level: 'info',
    },
  })
