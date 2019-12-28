import { PartialConfig, FullConfig } from '../types'

const config: PartialConfig<FullConfig> = {
  server: {
    securePort: 4443,
  },
  logging: {
    level: 'info',
  },
}

export default config
