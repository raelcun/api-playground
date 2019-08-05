import { Level } from 'pino'
import { DeepPartial } from '../types'

export interface FullConfig {
  server: {
    jwtSecret: string
    port: number
  }
  logging: {
    level: Level
  }
}
export type PartialConfig = DeepPartial<FullConfig>
