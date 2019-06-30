import { createMockContext } from '@shopify/jest-koa-mocks'
import { sign } from 'jsonwebtoken'
import { Enforce, Roles } from '../rbac/types'
import { getConfig } from '../../config'
import { enforceWithAuthHeaderInternal, Token } from './enforceAuthHeader'

const createToken = (token: Token) => sign(token, getConfig().server.jwtSecret)

describe('enforceWithAuthHeaderInternal', () => {
  test('should invoke next when enforcer succeeds', async () => {
    const mockEnforcer = () => Promise.resolve<Enforce>(async () => true)
    const token = createToken({ userId: 'foo', role: Roles.User })
    const mockContext = createMockContext({ headers: { authorization: `Bearer ${token}` } })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).toHaveBeenCalled()
  })

  test('should set status to 401 and set body when enforcer fails', async () => {
    const mockEnforcer = () => Promise.resolve<Enforce>(async () => false)
    const token = createToken({ userId: 'foo', role: Roles.User })
    const mockContext = createMockContext({ headers: { authorization: token } })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).not.toHaveBeenCalled()
  })
})
