import { Level } from 'pino'
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
    level: Level
  }
}
export type PartialConfig = DeepPartial<FullConfig>
