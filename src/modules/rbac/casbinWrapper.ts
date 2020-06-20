import { Enforcer, newEnforcer as libNewEnforcer } from 'casbin'
import { array as A, taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { Err } from '@modules/error/types'
import { createVoidTE } from '@modules/utils'

import { Actions, Enforce, Roles } from './types'

const wrapPromise = <T>(p: Promise<T>): TE.TaskEither<Err, T> =>
  TE.tryCatch(
    () => p,
    (e: Err) => e,
  )

export const newEnforcer: TE.TaskEither<Err<'ENFORCER_FACTORY_FAILED'>, Enforcer> = TE.tryCatch(
  () => libNewEnforcer(),
  () => ({ code: 'ENFORCER_FACTORY_FAILED', message: 'failed to instantiate base enforcer' }),
)

export const wrappedEnforce = (enforcer: Enforcer) => (subject: string) => (resource: string) => (
  action: string,
) => wrapPromise(enforcer.enforce(subject, resource, action))

export const enforce = (enforcer: Enforcer): Enforce => (subject, resource, ...actions) =>
  pipe(
    A.array.sequence(TE.taskEither)(actions.map(wrappedEnforce(enforcer)(subject)(resource))),
    TE.map(results => results.every(result => result === true)),
  )

const addPolicyToEnforcer = (enforcer: Enforcer) => (subject: string) => (resource: string) => (
  action: string,
): TE.TaskEither<Err, void> =>
  pipe(
    wrapPromise(enforcer.addPolicy(subject, resource, action)),
    TE.chain(result =>
      result === true
        ? createVoidTE()
        : TE.left({
            code: 'ENFORCER_ADD_POLICY_FAILURE',
            message: 'failed to load security policies',
          }),
    ),
  )

export const addPoliciesToEnforcer = <T extends keyof Actions, U extends Actions[T]>(
  subject: Roles,
  resource: T,
  ...actions: U[]
) => (enforcer: Enforcer): TE.TaskEither<Err<'ENFORCER_POLICY_LOAD_FAILURE' | string>, Enforcer> =>
  pipe(
    A.array.sequence(TE.taskEither)(actions.map(addPolicyToEnforcer(enforcer)(subject)(resource))),
    TE.map(() => enforcer),
  )
