import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'

import { getEmergencyLogger } from '@lib/emergency-logger'
import { logRequest } from '@modules/logging-middleware'
import { router } from '@root/routes'

const app = new Koa()

app.on('error', (err, ctx) => {
  getEmergencyLogger().error('koa logged error', { err, ctx })
})

app.use(helmet())
app.use(bodyParser())
app.use(logRequest)
app.use(router.routes())
app.use(router.allowedMethods())

export { app }
