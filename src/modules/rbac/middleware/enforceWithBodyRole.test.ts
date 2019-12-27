import { taskEither as TE } from 'fp-ts'
import { createKoaContext, createMockNext } from 'utils'
import HttpStatus from 'http-status-codes'
import { Context } from 'koa'
import { Roles } from '../types'
import { enforceWithBodyRoleMiddleware } from './enforceWithBodyRole'

const testUnauthorized = (mockContext: Context, mockNext: jest.Mock<Promise<void>, []>) => {
  test('should set status to 401', () => {
    expect(mockContext.status).toEqual(HttpStatus.UNAUTHORIZED)
  })

  test('should not invoke next', () => {
    expect(mockNext).not.toHaveBeenCalled()
  })
}

const testAuthorized = (mockContext: Context, mockNext: jest.Mock<Promise<void>, []>) => {
  test('should not set status to 401', () => {
    expect(mockContext.status).not.toEqual(HttpStatus.UNAUTHORIZED)
  })

  test('should invoke next once', () => {
    expect(mockNext).toHaveBeenCalledTimes(1)
  })
}

describe('enforcer middleware', () => {
  describe('when enforcer returns authorized', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(TE.right(() => TE.right(true)))('account', ['viewAny'])(
        mockContext,
        mockNext,
      )
    })

    testAuthorized(mockContext, mockNext)
  })

  describe('when enforcer returns unauthorized', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(TE.right(() => TE.right(false)))('account', ['viewAny'])(
        mockContext,
        mockNext,
      )
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe('when enforcer fails', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(TE.right(() => TE.left({ code: 'ENFORCER_FAILED' })))(
        'account',
        ['viewAny'],
      )(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe('when cannot get enforcer', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(TE.left({ code: 'CANNOT_GET_ENFORCER' }))('account', [
        'viewAny',
      ])(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe('when body validation fails', () => {
    const mockContext = createKoaContext({ requestBody: { foo: 'bar' } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(TE.right(() => TE.right(true)))('account', ['viewAny'])(
        mockContext,
        mockNext,
      )
    })

    testUnauthorized(mockContext, mockNext)
  })

  test('should not invoke next when body validation fails', async () => {
    const mockEnforcer = TE.right(() => TE.right(false))
    const mockContext = createKoaContext({ requestBody: { foo: 'bar' } })
    const next = createMockNext()
    await enforceWithBodyRoleMiddleware(mockEnforcer)('account', ['viewAny'])(mockContext, next)

    expect(mockContext.status).toEqual(HttpStatus.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })
})
