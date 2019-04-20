import { get } from 'config'
import { FullConfig } from './types'

let config: FullConfig
export const getConfig = (): FullConfig => {
  if (config === undefined) {
    config = {
      server: get('server'),
    }
  }
  return config
}
