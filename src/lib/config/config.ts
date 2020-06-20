import deepmerge from 'deepmerge'
import { array as A, either as E } from 'fp-ts'
import { sequenceT } from 'fp-ts/lib/Apply'
import { pipe } from 'fp-ts/lib/pipeable'

import { Err } from '@lib/error'
import { DeepPartial } from '@lib/utils'

import { ConfigMap } from './types'

const mergeDefaultWithPartials = <T>(defaultConfig: T) => (partialConfigs: DeepPartial<T>[]) => {
  const overwriteMerge = (destination: any[], source: any[]) => source

  let resConfig: T = defaultConfig
  partialConfigs.forEach(partial => {
    resConfig = deepmerge<T, DeepPartial<T>>(resConfig, partial, {
      arrayMerge: overwriteMerge,
    })
  })
  return resConfig
}

const merge = <T>(
  defaultConfig: E.Either<Err, T>,
  partialConfigs: E.Either<Err, DeepPartial<T>>[],
): E.Either<Err, T> =>
  pipe(
    sequenceT(E.either)(defaultConfig, A.array.sequence(E.either)(partialConfigs)),
    E.map(([defaultConfig, partialConfigs]) =>
      mergeDefaultWithPartials(defaultConfig)(partialConfigs),
    ),
  )

const notUndefined = <TValue>(value: TValue | undefined): value is TValue => value !== undefined

export const calculateConfig = <T>(
  configMap: ConfigMap<T>,
  env: string,
  context: string,
): E.Either<Err, T> => {
  const partialKeys = [
    `default-${context}`,
    env,
    `local-${env}`,
    `${env}-${context}`,
    `local-${env}-${context}`,
  ]

  const partialConfigs = partialKeys
    .map(key => configMap[key])
    .filter(notUndefined)
    .map(e => e())

  return merge(configMap.default(), partialConfigs)
}
