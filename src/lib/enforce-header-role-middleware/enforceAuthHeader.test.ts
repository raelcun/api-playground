import { taskEither as TE } from 'fp-ts'
import HttpStatus from 'http-status-codes'
import * as t from 'io-ts'
import { sign } from 'jsonwebtoken'
import { Context } from 'koa'

import { EnforceProvider, Roles, RolesV } from '@lib/rbac'
import { createMockLogger } from '@lib/test-utils'
import { createKoaContext, createMockNext } from '@modules/utils'

import { createEnforceWithAuthHeaderMiddleware } from './enforceAuthHeader'

const getConfig = () => ({ jwtSecret: 'foobar' })

const createMockContextAndNext = (authHeader: string) => ({
  mockContext: createKoaContext({
    headers: { authorization: authHeader },
  }),
  mockNext: createMockNext(),
})

const mockTokenV = t.type({
  userId: t.string,
  role: RolesV,
})
type MockToken = t.TypeOf<typeof mockTokenV>
const getRoleFromToken = (token: MockToken) => token.role

const createExpiredTokenHeader = () =>
  `Bearer ${sign(<MockToken>{ userId: 'foo', role: Roles.User }, getConfig().jwtSecret, {
    expiresIn: '-10s',
  })}`

const createInvalidTokenSchemaHeader = () =>
  `Bearer ${sign(<MockToken>{ userId: 'foo' }, getConfig().jwtSecret)}`

const createValidTokenHeader = () =>
  `Bearer ${sign(<MockToken>{ userId: 'foo', role: Roles.User }, getConfig().jwtSecret)}`

const createEnforceProviderThatReturnsAuthorized = () => TE.right(() => TE.right(true))
const createEnforceProviderThatReturnsUnauthorized = () => TE.right(() => TE.right(false))
const createEnforceProviderThatFailsToEnforce = () =>
  TE.right(() => TE.left({ code: 'ENFORCER_FAILED' }))
const createEnforceProviderThatFails = () => TE.left({ code: 'CANNOT_GET_ENFORCER' })

describe('enforceWithAuthHeader middleware', () => {
  describe.each<[string, string, EnforceProvider]>([
    [
      'when enforcer returns authorized and token is valid',
      createValidTokenHeader(),
      createEnforceProviderThatReturnsAuthorized(),
    ],
  ])('%s', (_, token, enforceProvider) => {
    const { mockNext, mockContext } = createMockContextAndNext(token)
    let logSpy: jest.SpyInstance

    beforeAll(async () => {
      const logger = createMockLogger()
      logSpy = jest.spyOn(logger, 'log')
      await createEnforceWithAuthHeaderMiddleware(
        enforceProvider,
        getConfig,
        () => logger,
        mockTokenV,
        getRoleFromToken,
      )('task', ['add'])(mockContext, mockNext)
    })

    test('should not set status to 401', () => {
      expect(mockContext.status).not.toEqual(HttpStatus.UNAUTHORIZED)
    })

    test('should invoke next once', () => {
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    test('should log error', () => {
      expect(logSpy.mock.calls).toMatchSnapshot()
    })
  })

  describe.each<[string, string, EnforceProvider]>([
    [
      'when enforcer returns unauthorized and token is valid',
      createValidTokenHeader(),
      createEnforceProviderThatReturnsUnauthorized(),
    ],
    [
      'when enforcer returns unauthorized and token schema is invalid',
      createInvalidTokenSchemaHeader(),
      createEnforceProviderThatReturnsUnauthorized(),
    ],
    ['when enforcer fails', createValidTokenHeader(), createEnforceProviderThatFailsToEnforce()],
    ['when cannot get enforcer', createValidTokenHeader(), createEnforceProviderThatFails()],
  ])('%s', (_, token, enforceProvider) => {
    const { mockNext, mockContext } = createMockContextAndNext(token)
    let logSpy: jest.SpyInstance

    beforeAll(async () => {
      const logger = createMockLogger()
      logSpy = jest.spyOn(logger, 'log')
      await createEnforceWithAuthHeaderMiddleware(
        enforceProvider,
        getConfig,
        () => logger,
        mockTokenV,
        getRoleFromToken,
      )('task', ['add'])(mockContext, mockNext)
    })

    test('should set status to 401', () => {
      expect(mockContext.status).toEqual(HttpStatus.UNAUTHORIZED)
    })

    test('should not invoke next', () => {
      expect(mockNext).not.toHaveBeenCalled()
    })

    test('should log error', () => {
      expect(logSpy.mock.calls).toMatchSnapshot()
    })
  })

  describe.each<[string, string]>([
    ['not using Bearer protocol', `Basic foo`],
    ['header has an invalid token format', 'Bearer foo'],
    ['token schema is invalid', createInvalidTokenSchemaHeader()],
    ['header has too many parts', `${createValidTokenHeader()} bar`],
    ['header is missing', undefined as any],
    ['token is expired', createExpiredTokenHeader()],
  ])('when enforcer returns authorized and %s', (_, authHeader) => {
    const mockContext = createKoaContext({
      headers: { authorization: authHeader },
    })
    const mockNext = createMockNext()
    let logSpy: jest.SpyInstance

    beforeAll(async () => {
      const logger = createMockLogger()
      logSpy = jest.spyOn(logger, 'log')
      await createEnforceWithAuthHeaderMiddleware(
        createEnforceProviderThatReturnsAuthorized(),
        getConfig,
        () => logger,
        mockTokenV,
        getRoleFromToken,
      )('task', ['add'])(mockContext, mockNext)
    })

    test('should set status to 401', () => {
      expect(mockContext.status).toEqual(HttpStatus.UNAUTHORIZED)
    })

    test('should not invoke next', () => {
      expect(mockNext).not.toHaveBeenCalled()
    })

    test('should log error', () => {
      expect(logSpy.mock.calls).toMatchSnapshot()
    })
  })
})
