import deepmerge from 'deepmerge'
import { array as A, either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { Err } from '@modules/error/types'

import { PartialConfig } from './types'

export type ConfigMap<T> = {
  default: () => E.Either<Err, T>
  [env: string]: (() => E.Either<Err, PartialConfig<T>>) | undefined
}

const mergeDefaultWithPartials = <T>(defaultConfig: T) => (partialConfigs: PartialConfig<T>[]) => {
  const overwriteMerge = (destination: any[], source: any[]) => source

  let resConfig: T = defaultConfig
  partialConfigs.forEach(partial => {
    resConfig = deepmerge<T, PartialConfig<T>>(resConfig, partial, {
      arrayMerge: overwriteMerge,
    })
  })
  return resConfig
}

const merge = <T>(
  defaultConfig: E.Either<Err, T>,
  partialConfigs: E.Either<Err, PartialConfig<T>>[],
): E.Either<Err, T> => {
  const composedPartialConfigs = A.array.sequence(E.either)(partialConfigs)

  return pipe(
    defaultConfig,
    E.chain(defaultConfig =>
      pipe(composedPartialConfigs, E.map(mergeDefaultWithPartials(defaultConfig))),
    ),
  )
}

const notUndefined = <TValue>(value: TValue | undefined): value is TValue => value !== undefined

export const mergeConfig = <T>(
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
