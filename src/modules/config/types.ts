import * as t from 'io-ts'

import { LoggingConfig } from '@lib/logger'
import { DeepPartial, NonEmptyString } from '@lib/utils'

export interface FullConfig {
  isProduction: boolean
  env: string
  server: {
    jwtSecret: string
    securePort: number
    insecurePort: number
    enableSSL: boolean
  }
  logging: LoggingConfig
  aws: {
    region: string
    credentials: {
      accessKeyId: string
      secretAccessKey: string
    }
  }
}

export type PartialConfig<T> = DeepPartial<T>

export type ConfigProvider = () => FullConfig

export const envVarsV = t.type({
  NODE_ENV: NonEmptyString,
  JWT_SECRET: NonEmptyString,
  AWS_ACCESS_KEY_ID: NonEmptyString,
  AWS_SECRET_ACCESS_KEY: NonEmptyString,
})
export type EnvVars = t.TypeOf<typeof envVarsV>
