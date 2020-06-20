import { either as E } from 'fp-ts'
import { Lazy } from 'fp-ts/lib/function'

import { Err } from '@lib/error'
import { DeepPartial } from '@lib/utils'

export type ConfigMap<T> = {
  default: () => E.Either<Err, T>
  [env: string]: Lazy<E.Either<Err, DeepPartial<T>>> | undefined
}
