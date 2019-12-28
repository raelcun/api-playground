import { LevelWithSilent } from 'pino'

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
    prettyPrint: boolean
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

type Primitive = string | number | boolean | bigint | symbol | undefined | null
export type PartialConfig<T> = {
  [P in keyof T]?: T[P] extends Primitive
    ? T[P]
    : T[P] extends Function
    ? T[P]
    : T[P] extends Date
    ? T[P]
    : T[P] extends (infer U)[]
    ? U[]
    : T[P] extends readonly (infer U)[]
    ? readonly U[]
    : PartialConfig<T[P]>
}

export type ConfigProvider = () => FullConfig
