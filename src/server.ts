import https from 'https'
import http from 'http'
import { createCertificate } from 'pem'
import { app } from './app'
import { getConfig } from './config'
import { getSystemLogger } from './modules/logger'

const { securePort, insecurePort, enableSSL } = getConfig().server

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
    },
  )
} else {
  getSystemLogger().trace('creating insecure server')
  const server = http.createServer(
    app.callback(),
  )
  
  getSystemLogger().trace('starting insecure server')
  server.listen(insecurePort, () => {
    getSystemLogger().info(`server started at http://localhost:${insecurePort}`)
  })
}
