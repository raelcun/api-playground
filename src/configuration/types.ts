import { LevelWithSilent } from 'pino'
import { DeepPartial } from '../types'

export interface FullConfig {
  isProduction: boolean
  env: string
  server: {
    jwtSecret: string
    securePort: number
    insecurePort: number
    enableSSL: boolean
  }
  logging: {
    level: LevelWithSilent
  }
  aws: {
    region: string
    credentials: {
      accessKeyId: string
      secretAccessKey: string
    }
  }
}
export type PartialConfig = DeepPartial<FullConfig>

export type ConfigProvider = () => FullConfig
