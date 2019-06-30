import { DeepPartial } from '../types'

export interface FullConfig {
  server: {
    jwtSecret: string
    port: number
  }
  logging: {
    level: string
  }
}
export type PartialConfig = DeepPartial<FullConfig>
