import { PartialConfig } from './types'

const config: PartialConfig = {
  server: {
    port: 4443,
  },
}

module.exports = {
  ...config,
  default: config,
}
