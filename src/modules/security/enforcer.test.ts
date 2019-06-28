import { createMockContext } from '@shopify/jest-koa-mocks'
import { enforceWithBodyRoleInternal } from './enforcer'

describe('enforcer', () => {
  test('should invoke next when enforcer succeeds', async () => {
    const mockEnforcer = () => Promise.resolve({ enforce: async () => true })
    const mockContext = createMockContext({ requestBody: { role: 'admin' } })
    const next = jest.fn()
    await enforceWithBodyRoleInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).toHaveBeenCalled()
  })

  test('should not invoke next when enforcer fails', async () => {
    const mockEnforcer = () => Promise.resolve({ enforce: async () => false })
    const mockContext = createMockContext({ requestBody: { role: 'admin' } })
    const next = jest.fn()
    await enforceWithBodyRoleInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).not.toHaveBeenCalled()
  })
})
