import { PartialConfig } from './types'

const config: PartialConfig = {
  server: {
    enableSSL: false
  }
}

module.exports = {
  ...config,
  default: config,
}
