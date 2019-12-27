import { createKoaContext, createMockNext } from 'utils'
import { sign } from 'jsonwebtoken'
import { getConfig } from 'configuration'
import { Roles, EnforceProvider } from 'modules/rbac/types'
import { taskEither as TE } from 'fp-ts'
import { testAuthorized, testUnauthorized } from 'testUtils'
import { enforceWithAuthHeaderMiddleware } from './enforceAuthHeader'

const createMockContextAndNext = (authHeader: string) => ({
  mockContext: createKoaContext({
    headers: { authorization: authHeader },
  }),
  mockNext: createMockNext(),
})

const createExpiredTokenHeader = () =>
  `Bearer ${sign({ userId: 'foo', role: Roles.User }, getConfig().server.jwtSecret, {
    notBefore: '1 day',
  })}`

const createInvalidTokenSchemaHeader = () =>
  `Bearer ${sign({ userId: 'foo' }, getConfig().server.jwtSecret)}`

const createValidTokenHeader = () =>
  `Bearer ${sign({ userId: 'foo', role: Roles.User }, getConfig().server.jwtSecret)}`

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

    beforeAll(async () => {
      await enforceWithAuthHeaderMiddleware(enforceProvider)(getConfig)('account', ['viewAny'])(
        mockContext,
        mockNext,
      )
    })

    testAuthorized(mockContext, mockNext)
  })

  describe.each<[string, string, EnforceProvider]>([
    [
      'when enforcer returns unauthorized and token is valid',
      createInvalidTokenSchemaHeader(),
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
    ['token schema is invalid', createInvalidTokenSchemaHeader()],
    ['header has too many parts', `${createValidTokenHeader()} bar`],
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
