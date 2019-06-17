import { FullConfig } from './types'

const config: FullConfig = {
  server: {
    port: 4443,
  },
}

module.exports = {
  ...config,
  default: config,
}
