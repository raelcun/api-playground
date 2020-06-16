import 'source-map-support/register'
import { config } from 'dotenv'
config()

import http from 'http'
import https from 'https'
import { createCertificate } from 'pem'

import { getConfig } from '@config'
import { getSystemLogger } from '@modules/logger'
import { app } from '@root/app'

const { securePort, insecurePort, enableSSL } = getConfig().server

const shutdown = (server: http.Server) => {
  server.close(() => {
    getSystemLogger().fatal('server shutdown')
    process.exit(0)
  })
}

if (enableSSL === true) {
  getSystemLogger().trace('generating ssl certificate')
  createCertificate(
    {
      selfSigned: true,
      days: 365 * 100,
    },
    (err, keys) => {
      if (err) {
        getSystemLogger().fatal('failed to create ssl cert', err)
        return
      }

      getSystemLogger().trace('creating secure server')
      const server = https.createServer(
        {
          cert: keys.certificate,
          key: keys.clientKey,
        },
        app.callback(),
      )

      getSystemLogger().trace('starting secure server')
      server.listen(securePort, () => {
        getSystemLogger().info(`server started at https://localhost:${securePort}`)
      })

      process.on('SIGTERM', () => shutdown(server))
      process.on('SIGINT', () => shutdown(server))
    },
  )
} else {
  getSystemLogger().trace('creating insecure server')
  const server = http.createServer(app.callback())

  getSystemLogger().trace('starting insecure server')
  server.listen(insecurePort, () => {
    getSystemLogger().info(`server started at http://localhost:${insecurePort}`)
  })

  process.on('SIGTERM', () => shutdown(server))
  process.on('SIGINT', () => shutdown(server))
}
