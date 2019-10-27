import { newEnforcer, newModel, Enforcer } from 'casbin'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { array } from 'fp-ts/lib/Array'
import { Error } from '../error/types'
import { Actions, Roles, Enforce } from './types'

const wrapPromise = <T>(p: Promise<T>): TE.TaskEither<Error, T> =>
  TE.tryCatch(() => p, (e: Error) => e)

const addPolicyToEnforcer = <T extends keyof Actions, U extends Actions[T]>(
  subject: Roles,
  resource: T,
  ...actions: U[]
) => (enforcer: Enforcer): TE.TaskEither<Error, Enforcer> => {
  const tasks = actions.map(action => wrapPromise(enforcer.addPolicy(subject, resource, action)))
  return pipe(
    array.sequence(TE.taskEither)(tasks),
    TE.chain(e => {
      return e.every(e => e === true)
        ? TE.right(enforcer)
        : TE.left({
            code: 'ENFORCER_POLICY_LOAD_FAILURE',
            message: 'failed to load all security policies',
          })
    }),
  )
}

const setEnforcerModel = (enforcer: Enforcer): TE.TaskEither<Error, Enforcer> =>
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

export const wrappedNewEnforcer: TE.TaskEither<Error, Enforcer> = TE.tryCatch(
  () => newEnforcer(),
  () => ({ code: 'ENFORCER_FACTORY_FAILED', message: 'failed to instantiate base enforcer' }),
)

const wrappedEnforce = (enforcer: Enforcer): Enforce => (
  subject: string,
  resource: string,
  ...actions: string[]
) => {
  const tasks = actions.map(action => wrapPromise(enforcer.enforce(subject, resource, action)))
  return pipe(
    array.sequence(TE.taskEither)(tasks),
    TE.map(e => e.every(e => e === true)),
  )
}

export const createEnforcer: TE.TaskEither<Error, Enforcer> = pipe(
  wrappedNewEnforcer,
  TE.chain(setEnforcerModel),
  TE.chain(addPolicyToEnforcer(Roles.User, 'account', 'viewOwn', 'viewAny')),
)

let enforcerInstance: Promise<E.Either<Error, Enforcer>>
export const getEnforcer: TE.TaskEither<Error, Enforce> = async () => {
  if (enforcerInstance === undefined) {
    enforcerInstance = createEnforcer()
  }

  return pipe(
    await enforcerInstance,
    E.map(enforcer => wrappedEnforce(enforcer)),
  )
}
