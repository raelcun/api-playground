import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'

import { createEnforcer, getEnforcer } from './enforcer'
import { Roles } from './types'

describe('enforcer', () => {
  test('security policies match snapshot', async () => {
    expect.assertions(1)

    await pipe(
      createEnforcer,
      TE.chain(enforcer => TE.rightTask(() => enforcer.getPolicy())),
      TE.map(policy => expect(policy).toMatchSnapshot()),
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

    const result = await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.Admin, 'account', 'viewOwn')),
    )()

    expect(result).toMatchSnapshot()
  })

  test('validation passes for admin with fake resource', async () => {
    expect.assertions(1)

    const result = await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.Admin, 'fakeResource' as any, 'viewAny')),
    )()

    expect(result).toMatchSnapshot()
  })

  test('validation passes for admin with fake action', async () => {
    expect.assertions(1)

    const result = await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.Admin, 'account', 'fakeAction' as any)),
    )()

    expect(result).toMatchSnapshot()
  })

  test('validation fails for user with insuffient priviledges', async () => {
    expect.assertions(1)

    const result = await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.User, 'account', 'editAny')),
    )()

    expect(result).toMatchSnapshot()
  })

  test('validation fails for user with fake resource', async () => {
    expect.assertions(1)

    const result = await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.User, 'fakeResource' as any, 'editAny')),
    )()

    expect(result).toMatchSnapshot()
  })

  test('validation fails for user with fake action', async () => {
    expect.assertions(1)

    const result = await pipe(
      getEnforcer,
      TE.chain(enforce => enforce(Roles.User, 'account', 'fakeAction' as any)),
    )()

    expect(result).toMatchSnapshot()
  })
})
