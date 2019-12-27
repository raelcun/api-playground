import { newModel, Enforcer } from 'casbin'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { createVoidTE } from 'utils'
import { Err } from '../error/types'
import { Roles, Enforce, Actions, EnforceProvider } from './types'
import { newEnforcer, enforce, addPoliciesToEnforcer } from './wrapper'

const setEnforcerModel = (enforcer: Enforcer): TE.TaskEither<Err, Enforcer> =>
  TE.tryCatch(
    async () => {
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
      return enforcer
    },
    () => ({ code: 'ENFORCER_SETMODEL_FAILED', message: 'failed to set enforcer model' }),
  )

export const createEnforcer: TE.TaskEither<Err, Enforcer> = pipe(
  newEnforcer,
  TE.chain(setEnforcerModel),
  TE.chain(addPoliciesToEnforcer(Roles.User, 'account', 'viewOwn', 'viewAny')),
)

let enforcerInstance: Promise<E.Either<Err, Enforcer>>
export const getEnforcer: EnforceProvider = async () => {
  if (enforcerInstance === undefined) {
    enforcerInstance = createEnforcer()
  }

  return pipe(
    await enforcerInstance,
    E.map(enforcer => enforce(enforcer)),
  )
}

export const enforceRole = (enforceFnProvider: TE.TaskEither<Err, Enforce>) => <
  T extends keyof Actions,
  U extends Actions[T]
>(
  resource: T,
) => (actions: U[]) => (role: Roles): TE.TaskEither<Err, void> =>
  pipe(
    enforceFnProvider,
    TE.chain(enforce => enforce(role, resource, ...actions)),
    TE.chain(result => (result === true ? createVoidTE() : TE.left({ code: 'ROLE_REJECTED' }))),
  )
