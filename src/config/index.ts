import { util } from 'config'
import { FullConfig } from './types'

let config: FullConfig
export const getConfig = (): FullConfig => {
  if (config === undefined) {
    config = util.toObject()
  }
  return config
}
