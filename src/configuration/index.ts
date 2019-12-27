import { get } from 'config'
import { FullConfig } from './types'

let config: FullConfig
export const getConfig = (): FullConfig => {
  if (config === undefined) {
    config = {
      isProduction: get('isProduction'),
      env: get('env'),
      server: get('server'),
      logging: get('logging'),
      aws: get('aws'),
    }
  }
  return config
}
