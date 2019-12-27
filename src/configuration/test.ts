import { PartialConfig } from './types'

const config: PartialConfig = {
  logging: {
    level: 'info',
  },
}

module.exports = {
  ...config,
  default: config,
}
