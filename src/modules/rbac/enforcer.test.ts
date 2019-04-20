import { createEnforcer } from './enforcer'

describe('enforcer', () => {
  test('security model matches snapshot', async () => {
    const enforcer = await createEnforcer()
    expect(enforcer.getModel().model).toMatchSnapshot()
  })

  test('security policies match snapshot', async () => {
    const enforcer = await createEnforcer()
    expect(enforcer.getPolicy()).toMatchSnapshot()
  })

  test('admin works', async () => {
    const enforcer = await createEnforcer()
    expect(enforcer.enforce('admin', 'anyResource', 'doAnything')).toBeTruthy()
  })
})
