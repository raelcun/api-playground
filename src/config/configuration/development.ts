import { PartialConfig, FullConfig } from '../types'
import secret from './secret'

const config: PartialConfig<FullConfig> = {
  server: {
    enableSSL: false,
  },
  aws: secret.aws,
}

export default config
