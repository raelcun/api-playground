import { PartialConfig } from './types'

const config: PartialConfig = {
  server: {
    port: 4443,
  },
  logging: {
    level: 'error',
  },
}

module.exports = {
  ...config,
  default: config,
}
