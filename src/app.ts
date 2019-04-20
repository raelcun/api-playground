import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import { router } from './routes/adminThing'
import { getSystemLogger } from './modules/logger'

const app = new Koa()

app.on('error', (err, ctx) => {
  getSystemLogger().error('koa logged error', { err, ctx })
})

app.use(helmet())
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

export { app }
