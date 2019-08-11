import { FullConfig } from './types'

const config: FullConfig = {
  server: {
    jwtSecret: '9m02fgRYt77vPV6qSa5uigFhml0AgDsqyeMAAWtFah1KBZ8SjLK8CVD2e5QrCkMl',
    securePort: 4443,
    insecurePort: 4080,
    enableSSL: true
  },
  logging: {
    level: 'info',
  },
}

module.exports = {
  ...config,
  default: config,
}
