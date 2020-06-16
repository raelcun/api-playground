import * as t from 'io-ts'
import { LevelWithSilent } from 'pino'

import { DeepPartial } from '@root/utils/types'

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

export type PartialConfig<T> = DeepPartial<T>

export type ConfigProvider = () => FullConfig

// export const envVarsV = t.type({
//   NODE_ENV: NonEmptyString,
//   JWT_SECRET: NonEmptyString,
//   AWS_ACCESS_KEY_ID: NonEmptyString,
//   AWS_SECRET_ACCESS_KEY: NonEmptyString,
// })
export const envVarsV = t.type({
  NODE_ENV: t.string,
  JWT_SECRET: t.string,
  AWS_ACCESS_KEY_ID: t.string,
  AWS_SECRET_ACCESS_KEY: t.string,
})
export type EnvVars = t.TypeOf<typeof envVarsV>
