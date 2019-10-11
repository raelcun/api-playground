import { createEnforcer, getEnforcer } from './enforcer'
import { Roles } from './types'

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
    const enforcer = await getEnforcer()
    const result = await enforcer(Roles.Admin, 'account', 'viewOwn')
    expect(result).toBe(true)
  })

  test('enforcer fails', async () => {
    const enforcer = await getEnforcer()
    const result = await enforcer(Roles.User, 'account', 'doAnything' as any)
    expect(result).toEqual(false)
  })
})
