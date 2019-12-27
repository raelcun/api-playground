// import * as TE from 'fp-ts/lib/TaskEither'
// import * as E from 'fp-ts/lib/Either'
// import { createKoaContext } from 'utils'
// import { Roles } from 'modules/rbac/types'
// import { enforceWithBodyRoleInternal } from './enforceWithBodyRole'

describe('enforcer', () => {
  test('', () => {})
  // test('should invoke next when enforcer succeeds', async () => {
  //   const mockEnforcer = TE.right(() => TE.fromEither(E.right(true)))
  //   const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
  //   const next = jest.fn()
  //   await enforceWithBodyRoleInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
  //   expect(next).toHaveBeenCalled()
  // })
  // test('should not invoke next when enforcer fails', async () => {
  //   const mockEnforcer = TE.right(() => TE.fromEither(E.right(false)))
  //   const mockContext = createKoaContext({ requestBody: { role: Roles.Admin } })
  //   const next = jest.fn()
  //   await enforceWithBodyRoleInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
  //   expect(next).not.toHaveBeenCalled()
  // })
})
