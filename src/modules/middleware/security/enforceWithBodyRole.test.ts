import { createMockContext } from '@shopify/jest-koa-mocks'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { enforceWithBodyRoleInternal } from './enforceWithBodyRole'

describe('enforcer', () => {
  test('should invoke next when enforcer succeeds', async () => {
    const mockEnforcer = TE.right(() => TE.fromEither(E.right(true)))
    const mockContext = createMockContext({ requestBody: { role: 'admin' } })
    const next = jest.fn()
    await enforceWithBodyRoleInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).toHaveBeenCalled()
  })

  test('should not invoke next when enforcer fails', async () => {
    const mockEnforcer = TE.right(() => TE.fromEither(E.right(false)))
    const mockContext = createMockContext({ requestBody: { role: 'admin' } })
    const next = jest.fn()
    await enforceWithBodyRoleInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).not.toHaveBeenCalled()
  })
})
