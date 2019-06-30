import { newEnforcer, newModel, Enforcer } from 'casbin'
import { Actions, Roles, Enforce } from './types'

const addPolicyToEnforcer = (enforcer: Enforcer) => async <
  T extends keyof Actions,
  U extends Actions[T]
>(
  subject: Roles,
  resource: T,
  ...actions: U[]
) =>
  Promise.all(actions.map(action => enforcer.addPolicy(subject, resource, action))).then(e =>
    e.every(e => e === true),
  )

export const createEnforcer = async () => {
  const enforcer = await newEnforcer()
  enforcer.setModel(
    newModel(`
      [request_definition]
      r = sub, obj, act
      
      [policy_definition]
      p = sub, obj, act
      
      [role_definition]
      g = _, _
      
      [policy_effect]
      e = some(where (p.eft == allow))
      
      [matchers]
      m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act || r.sub == "admin"
    `),
  )

  const addPolicy = addPolicyToEnforcer(enforcer)

  const results = await Promise.all([addPolicy('user', 'account', 'viewOwn', 'viewAny')])

  if (results.every(e => e !== true)) throw new Error('failed to load all security policies')

  return enforcer
}

let enforcerInstance: Enforcer
export const getEnforcer = async (): Promise<Enforce> => {
  if (enforcerInstance === undefined) {
    enforcerInstance = await createEnforcer()
  }

  return (subject, resource, ...actions) =>
    Promise.all(actions.map(action => enforcerInstance.enforce(subject, resource, action)))
      .then(results => results.every(e => e === true))
      .catch(() => false)
}
