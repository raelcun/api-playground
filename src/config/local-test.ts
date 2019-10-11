import { PartialConfig } from './types'

const config: PartialConfig = {
  logging: {
    level: 'error',
  },
}

module.exports = {
  ...config,
  default: config,
}
