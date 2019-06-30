import { PartialConfig } from './types'

const config: PartialConfig = {
  logging: {
    level: 'trace',
  },
}

module.exports = {
  ...config,
  default: config,
}
