import { PartialConfig } from './types'

const config: PartialConfig = {
  server: {
    securePort: 4443,
  },
  logging: {
    level: 'error',
  },
}

module.exports = {
  ...config,
  default: config,
}
