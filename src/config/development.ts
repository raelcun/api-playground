import { PartialConfig } from './types'
import secret from './secret'

const config: PartialConfig = {
  server: {
    enableSSL: false,
  },
  aws: secret.aws,
}

module.exports = {
  ...config,
  default: config,
}
