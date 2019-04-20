import { newEnforcer, newModel, Enforcer } from 'casbin'
import { Actions, Subject } from './types'

const addPolicyToEnforcer = (enforcer: Enforcer) => async <
  T extends keyof Actions,
  U extends Actions[T]
>(
  subject: Subject,
  resource: T,
  ...actions: U[]
) =>
  Promise.all(actions.map(action => enforcer.addPolicy(subject, resource, action))).then(e =>
    e.every(e => e === true),
  )

export interface APIEnforcer {
  enforce: <T extends keyof Actions, U extends Actions[T]>(
    subject: Subject,
    resource: T,
    ...actions: U[]
  ) => boolean
}

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
export const getEnforcer = async (): Promise<APIEnforcer> => {
  if (enforcerInstance === undefined) {
    enforcerInstance = await createEnforcer()
  }

  return Promise.resolve({
    enforce: (subject, resource, ...actions) =>
      actions
        .map(action => enforcerInstance.enforce(subject, resource, action))
        .every(e => e === true),
  })
}
