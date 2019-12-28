import { FullConfig } from '../types'

const env = process.env.NODE_ENV || 'production'

const config: FullConfig = {
  isProduction: env === 'production',
  env,
  server: {
    jwtSecret: '9m02fgRYt77vPV6qSa5uigFhml0AgDsqyeMAAWtFah1KBZ8SjLK8CVD2e5QrCkMl',
    securePort: 4443,
    insecurePort: 4080,
    enableSSL: true,
  },
  logging: {
    prettyPrint: false,
    level: 'info',
  },
  aws: {
    region: 'UNSET',
    credentials: {
      accessKeyId: 'UNSET',
      secretAccessKey: 'UNSET',
    },
  },
}

export default config
