import https from 'https'
import { createCertificate } from 'pem'
import { app } from './app'
import { getConfig } from './config'
import { getSystemLogger } from './modules/logger'

const PORT = getConfig().server.port

createCertificate(
  {
    selfSigned: true,
    days: 365 * 100,
  },
  (_, keys) => {
    const server = https.createServer(
      {
        cert: keys.certificate,
        key: keys.clientKey,
      },
      app.callback(),
    )
    server.listen(PORT, () => {
      getSystemLogger().info(`server started at https://localhost:${PORT}`)
    })
  },
)
