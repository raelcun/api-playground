import { ConfigMap, mergeConfig } from './config'
import defaultConfig from './configuration/default'
import developmentConfig from './configuration/development'
import developmentTestingConfig from './configuration/development-testing'
import productionConfig from './configuration/production'
import { FullConfig } from './types'

const env = process.env.NODE_ENV || 'production'
const context = process.env.NODE_APP_CONTEXT || ''

const configMap: ConfigMap<FullConfig> = {
  default: defaultConfig,
  development: developmentConfig,
  'development-testing': developmentTestingConfig,
  production: productionConfig,
}

const config: FullConfig = mergeConfig(configMap, env, context)

export const getConfig = (): FullConfig => config
