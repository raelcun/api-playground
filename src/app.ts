import Koa from 'koa'
import router from 'koa-joi-router'
import bodyParser from 'koa-bodyparser'
import { AccessControl } from 'accesscontrol'
import Joi from 'joi'

const app = new Koa()

const r = router()

const ac = new AccessControl()
ac.grant('user').createOwn('userThing')
ac.grant('admin').createAny('adminThing') // only admins can do admin things

const accessControl = (f: (ac: AccessControl, role: string) => boolean): Koa.Middleware => (
  ctx,
  next,
) => {
  const { role } = ctx.request.body
  if (f(ac, role)) {
    next()
  } else {
    ctx.status = 401
  }
}

r.route({
  method: 'post',
  path: '/adminThing',
  validate: {
    type: 'json',
    body: Joi.object().keys({
      role: Joi.string()
        .not()
        .empty()
        .required(),
    }),
  },
  handler: [
    accessControl((ac, role) => ac.can(role).createAny('adminThing').granted),
    ctx => {
      ctx.body = 'here is your admin thing'
    },
  ],
})

app.use(bodyParser())
app.use(r.middleware())

export { app }
