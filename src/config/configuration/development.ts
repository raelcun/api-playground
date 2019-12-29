import { FullConfig, PartialConfig } from '../types'
import secret from './secret'

const config: PartialConfig<FullConfig> = {
  server: {
    enableSSL: false,
  },
  logging: {
    prettyPrint: true,
  },
  aws: secret.aws,
}

export default config
