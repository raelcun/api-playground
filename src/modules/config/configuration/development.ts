import { either as E } from 'fp-ts'

import { Err } from '@lib/error'

import { FullConfig, PartialConfig } from '../types'

export default (): E.Either<Err, PartialConfig<FullConfig>> =>
  E.right({
    server: {
      enableSSL: false,
    },
    logging: {
      prettyPrint: true,
      level: 'trace',
    },
  })
