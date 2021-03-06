import { either as E } from 'fp-ts'

import { calculateConfig, ConfigMap } from '@lib/config'
import { getEmergencyLogger } from '@lib/emergency-logger'

import getDefaultConfig from './configuration/default'
import getDevelopmentConfig from './configuration/development'
import getDevelopmentTestingConfig from './configuration/development-testing'
import getProductionConfig from './configuration/production'
import { FullConfig } from './types'

let config: FullConfig
const loadConfig = () => {
  const configMap: ConfigMap<FullConfig> = {
    default: getDefaultConfig,
    development: getDevelopmentConfig,
    'development-testing': getDevelopmentTestingConfig,
    production: getProductionConfig,
  }

  const mergeResult = calculateConfig(
    configMap,
    process.env.NODE_ENV || '',
    process.env.NODE_APP_CONTEXT || '',
  )

  if (E.isLeft(mergeResult)) {
    getEmergencyLogger().fatal('CONFIG_LOAD_FAILED', mergeResult.left)
    throw mergeResult.left
  } else {
    config = mergeResult.right
  }
}

export const getConfig = (): FullConfig => {
  if (config === undefined) {
    loadConfig()
  }
  return config
}
