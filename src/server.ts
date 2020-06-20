import 'source-map-support/register'
import { config } from 'dotenv'
config()

import http from 'http'
import https from 'https'
import { sign } from 'jsonwebtoken'
import { createCertificate } from 'pem'

import { getEmergencyLogger } from '@lib/emergency-logger'
import { getConfig } from '@modules/config'
import { getSystemLogger } from '@modules/logger'
import { app } from '@root/app'

const { securePort, insecurePort, enableSSL } = getConfig().server

const shutdown = (server: http.Server) => {
  server.close(() => {
    getSystemLogger().fatal({ payload: { message: 'server shutdown' } })
    process.exit(0)
  })
}

if (enableSSL === true) {
  getSystemLogger().trace({ payload: { message: 'generating ssl certificate' } })
  createCertificate(
    {
      selfSigned: true,
      days: 365 * 100,
    },
    (err, keys) => {
      if (err) {
        getSystemLogger().fatal({
          payload: { code: 'SSL_CERT_FAILED', message: 'failed to create ssl cert', meta: { err } },
        })
        return
      }

      getSystemLogger().trace({ payload: { message: 'creating secure server' } })
      const server = https.createServer(
        {
          cert: keys.certificate,
          key: keys.clientKey,
        },
        app.callback(),
      )

      getSystemLogger().trace({ payload: { message: 'starting secure server' } })
      server.listen(securePort, () => {
        getSystemLogger().info({
          payload: {
            message: 'server started',
            meta: { route: `https://localhost:${securePort}` },
          },
        })
      })

      process.on('SIGTERM', () => shutdown(server))
      process.on('SIGINT', () => shutdown(server))
    },
  )
} else {
  getSystemLogger().trace({ payload: { message: 'creating insecure server' } })
  const server = http.createServer(app.callback())

  getSystemLogger().trace({ payload: { message: 'starting insecure server' } })
  server.listen(insecurePort, () => {
    getSystemLogger().info({
      payload: { message: 'server started', meta: { route: `http://localhost:${insecurePort}` } },
    })
  })

  process.on('SIGTERM', () => shutdown(server))
  process.on('SIGINT', () => shutdown(server))
}

if (!getConfig().isProduction) {
  getEmergencyLogger().info(
    `admin token ${sign({ userId: 'raelcun', role: 'admin' }, getConfig().server.jwtSecret)}`,
  )
  getEmergencyLogger().info(
    `user token ${sign({ userId: 'raelcun', role: 'user' }, getConfig().server.jwtSecret)}`,
  )
}
