import { Context } from 'koa'
import HttpStatus from 'http-status-codes'
import { createKoaContext, createMockNext } from 'utils'
import { sign } from 'jsonwebtoken'
import { getConfig } from 'configuration'
import { Roles, EnforceProvider } from 'modules/rbac/types'
import { taskEither as TE } from 'fp-ts'
import { Token } from '../types'
import { enforceWithAuthHeaderMiddleware } from './enforceAuthHeader'

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

const createMockContextAndNext = (token: Token) => ({
  mockContext: createKoaContext({
    headers: { authorization: `Bearer ${sign(token, getConfig().server.jwtSecret)}` },
  }),
  mockNext: createMockNext(),
})

const createExpiredTokenHeader = () =>
  `Bearer ${sign({ userId: 'foo', role: Roles.User }, getConfig().server.jwtSecret, {
    notBefore: '1 day',
  })}`

const createValidToken = (): Token => ({ userId: 'foo', role: Roles.User })
const createInvalidToken = (): Token => ({ userId: 'foo' } as any)
const createEnforceProviderThatReturnsAuthorized = () => TE.right(() => TE.right(true))
const createEnforceProviderThatReturnsUnauthorized = () => TE.right(() => TE.right(false))
const createEnforceProviderThatFailsToEnforce = () =>
  TE.right(() => TE.left({ code: 'ENFORCER_FAILED' }))
const createEnforceProviderThatFails = () => TE.left({ code: 'CANNOT_GET_ENFORCER' })

describe('enforceWithAuthHeader middleware', () => {
  describe.each<[string, Token, EnforceProvider]>([
    [
      'when enforcer returns authorized and token is valid',
      createValidToken(),
      createEnforceProviderThatReturnsAuthorized(),
    ],
  ])('%s', (_, token, enforceProvider) => {
    const { mockNext, mockContext } = createMockContextAndNext(token)

    beforeAll(async () => {
      await enforceWithAuthHeaderMiddleware(enforceProvider)(getConfig)('account', ['viewAny'])(
        mockContext,
        mockNext,
      )
    })

    testAuthorized(mockContext, mockNext)
  })

  describe.each<[string, Token, EnforceProvider]>([
    [
      'when enforcer returns authorized and token schema is invalid',
      createInvalidToken(),
      createEnforceProviderThatReturnsAuthorized(),
    ],
    [
      'when enforcer returns unauthorized and token is valid',
      createValidToken(),
      createEnforceProviderThatReturnsUnauthorized(),
    ],
    [
      'when enforcer returns unauthorized and token schema is invalid',
      createInvalidToken(),
      createEnforceProviderThatReturnsUnauthorized(),
    ],
    ['when enforcer fails', createValidToken(), createEnforceProviderThatFailsToEnforce()],
    ['when cannot get enforcer', createValidToken(), createEnforceProviderThatFails()],
  ])('%s', (_, token, enforceProvider) => {
    const { mockNext, mockContext } = createMockContextAndNext(token)

    beforeAll(async () => {
      await enforceWithAuthHeaderMiddleware(enforceProvider)(getConfig)('account', ['viewAny'])(
        mockContext,
        mockNext,
      )
    })

    testUnauthorized(mockContext, mockNext)
  })

  describe.each<[string, string]>([
    ['not using Bearer protocol', `Basic foo`],
    ['header has an invalid token format', 'Bearer foo'],
    ['header has too many parts', `Bearer foo bar`],
    ['header is missing', undefined as any],
    ['token is expired', createExpiredTokenHeader()],
  ])('when enforcer returns authorized and %s', (_, authHeader) => {
    const mockContext = createKoaContext({
      headers: { authorization: authHeader },
    })
    const mockNext = createMockNext()

    beforeAll(async () => {
      await enforceWithAuthHeaderMiddleware(createEnforceProviderThatReturnsAuthorized())(
        getConfig,
      )('account', ['viewAny'])(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })
})
