import { PartialConfig } from './types'

const config: PartialConfig = {
  logging: {
    level: 'silent',
  },
}

module.exports = {
  ...config,
  default: config,
}
