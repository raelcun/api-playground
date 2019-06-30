import { DeepPartial } from '../types'

export interface FullConfig {
  server: {
    jwtSecret: string
    port: number
  }
}
export type PartialConfig = DeepPartial<FullConfig>
