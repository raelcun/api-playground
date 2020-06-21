import { taskEither as TE } from 'fp-ts'
import * as t from 'io-ts'
import { sign } from 'jsonwebtoken'

import { EnforceProvider, Roles, RolesV } from '@lib/rbac'
import { testAuthorized, testUnauthorized } from '@lib/test-utils'
import { createKoaContext, createMockNext } from '@modules/utils'

import { createEnforceWithAuthHeaderMiddleware } from './enforceAuthHeader'

const getConfig = () => ({ jwtSecret: 'foobar' })

const createMockContextAndNext = (authHeader: string) => ({
  mockContext: createKoaContext({
    headers: { authorization: authHeader },
  }),
  mockNext: createMockNext(),
})

const tokenV = t.type({
  userId: t.string,
  role: RolesV,
})
type Token = t.TypeOf<typeof tokenV>
const getRoleFromToken = (token: Token) => token.role

const createExpiredTokenHeader = () =>
  `Bearer ${sign(<Token>{ userId: 'foo', role: Roles.User }, getConfig().jwtSecret, {
    notBefore: '1 day',
  })}`

const createInvalidTokenSchemaHeader = () =>
  `Bearer ${sign(<Token>{ userId: 'foo' }, getConfig().jwtSecret)}`

const createValidTokenHeader = () =>
  `Bearer ${sign(<Token>{ userId: 'foo', role: Roles.User }, getConfig().jwtSecret)}`

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
      await createEnforceWithAuthHeaderMiddleware(
        enforceProvider,
        getConfig,
        tokenV,
        getRoleFromToken,
      )('task', ['add'])(mockContext, mockNext)
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
      await createEnforceWithAuthHeaderMiddleware(
        enforceProvider,
        getConfig,
        tokenV,
        getRoleFromToken,
      )('task', ['add'])(mockContext, mockNext)
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
      await createEnforceWithAuthHeaderMiddleware(
        createEnforceProviderThatReturnsAuthorized(),
        getConfig,
        tokenV,
        getRoleFromToken,
      )('task', ['add'])(mockContext, mockNext)
    })

    testUnauthorized(mockContext, mockNext)
  })
})
