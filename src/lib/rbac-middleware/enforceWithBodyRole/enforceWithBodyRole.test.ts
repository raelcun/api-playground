import { taskEither as TE } from 'fp-ts'
import HttpStatus from 'http-status-codes'

import { createMockLogger, testAuthorized, testUnauthorized } from '@lib/test-utils'
import { createKoaContext, createMockNext } from '@modules/utils'

import { Roles } from '../../rbac/types'
import { enforceWithBodyRoleMiddleware } from './enforceWithBodyRole'

describe('enforcerWithBodyRole middleware', () => {
  describe('when enforcer returns authorized', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(createMockLogger)(TE.right(() => TE.right(true)))(
        'task',
        ['add'],
      )(mockContext, mockNext)
    })

    testAuthorized(mockContext, mockNext)
  })

  describe('when enforcer returns unauthorized', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(createMockLogger)(TE.right(() => TE.right(false)))(
        'task',
        ['add'],
      )(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe('when enforcer fails', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(createMockLogger)(
        TE.right(() => TE.left({ code: 'ENFORCER_FAILED' })),
      )('task', ['add'])(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe('when cannot get enforcer', () => {
    const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(createMockLogger)(
        TE.left({ code: 'CANNOT_GET_ENFORCER' }),
      )('task', ['add'])(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe('when body validation fails', () => {
    const mockContext = createKoaContext({ requestBody: { foo: 'bar' } })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithBodyRoleMiddleware(createMockLogger)(TE.right(() => TE.right(true)))(
        'task',
        ['add'],
      )(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })

  test('should not invoke next when body validation fails', async () => {
    const mockEnforcer = TE.right(() => TE.right(false))
    const mockContext = createKoaContext({ requestBody: { foo: 'bar' } })
    const next = createMockNext()
    await enforceWithBodyRoleMiddleware(createMockLogger)(mockEnforcer)('task', ['add'])(
      mockContext,
      next,
    )

    expect(mockContext.status).toEqual(HttpStatus.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })
})
