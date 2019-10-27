import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { createEnforcer, getEnforcer } from './enforcer'
import { Roles } from './types'

describe('enforcer', () => {
  test('security policies match snapshot', async () => {
    expect.assertions(1)

    await pipe(
      createEnforcer,
      TE.map(enforcer => {
        expect(enforcer.getPolicy()).toMatchSnapshot()
      }),
    )()
  })

  test('security model matches snapshot', async () => {
    expect.assertions(1)

    await pipe(
      createEnforcer,
      TE.map(enforcer => {
        expect(enforcer.getModel().model).toMatchSnapshot()
      }),
    )()
  })

  test('validation passes for admin with real resource and action', async () => {
    expect.assertions(1)

    await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.Admin, 'account', 'viewOwn')),
      TE.map(result => {
        expect(result).toBe(true)
      }),
    )()
  })

  test('validation passes for admin with fake resource', async () => {
    expect.assertions(1)

    await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.Admin, 'fakeResource', 'viewAny')),
      TE.map(result => {
        expect(result).toBe(true)
      }),
    )()
  })

  test('validation passes for admin with fake action', async () => {
    expect.assertions(1)

    await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.Admin, 'account', 'fakeAction')),
      TE.map(result => {
        expect(result).toBe(true)
      }),
    )()
  })

  test('validation fails for user with insuffient priviledges', async () => {
    expect.assertions(1)

    await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.User, 'account', 'editAny')),
      TE.map(result => {
        expect(result).toBe(false)
      }),
    )()
  })

  test('validation fails for user with fake resource', async () => {
    expect.assertions(1)

    await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.User, 'fakeResource', 'editAny')),
      TE.map(result => {
        expect(result).toBe(false)
      }),
    )()
  })

  test('validation fails for user with fake action', async () => {
    expect.assertions(1)

    await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.User, 'account', 'fakeAction')),
      TE.map(result => {
        expect(result).toBe(false)
      }),
    )()
  })
})
