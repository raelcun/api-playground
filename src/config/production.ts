import { FullConfig } from './types'

const config: FullConfig = {
  server: {
    port: 443,
  },
}

module.exports = {
  ...config,
  default: config,
}
