import { FullConfig } from './types'
import { get } from 'config'

let config: FullConfig
export const getConfig = (): FullConfig => {
  if (config === undefined) {
    config = {
      server: get('server'),
    }
  }
  return config
}
