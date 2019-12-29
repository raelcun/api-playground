import deepmerge from 'deepmerge'

import { PartialConfig } from './types'

export type ConfigMap<T> = { default: T; [env: string]: PartialConfig<T> | undefined }

const merge = <T>(config: T, partials: PartialConfig<T>[]): T => {
  const overwriteMerge = (destination: any[], source: any[]) => source

  let resConfig: T = config
  partials.forEach(partial => {
    resConfig = deepmerge<T, PartialConfig<T>>(resConfig, partial, {
      arrayMerge: overwriteMerge,
    })
  })

  return resConfig
}

export const mergeConfig = <T>(configMap: ConfigMap<T>, env: string, context: string) => {
  const partialKeys = [
    `default-${context}`,
    env,
    `local-${env}`,
    `${env}-${context}`,
    `local-${env}-${context}`,
  ]

  const partials = partialKeys
    .map(key => configMap[key])
    .filter((e: PartialConfig<T> | undefined): e is PartialConfig<T> => e !== undefined)

  return merge(configMap.default, partials)
}
