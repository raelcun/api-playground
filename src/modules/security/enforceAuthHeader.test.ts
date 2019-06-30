import { createMockContext } from '@shopify/jest-koa-mocks'
import { sign } from 'jsonwebtoken'
import { Context } from 'koa'
import { Enforce, Roles } from '../rbac/types'
import { getConfig } from '../../config'
import { enforceWithAuthHeaderInternal, Token } from './enforceAuthHeader'

const createToken = (token: Token = { userId: 'foo', role: Roles.User }) =>
  sign(token, getConfig().server.jwtSecret)
const createDefaultMockContext = (token: Token = { userId: 'foo', role: Roles.User }) =>
  createMockContext({ headers: { authorization: `Bearer ${createToken(token)}` } })

const expectUnauthorized = (mockContext: Context, next: jest.Mock) => {
  expect(mockContext.status).toEqual(401)
  expect(mockContext.body).toMatchSnapshot()
  expect(next).not.toHaveBeenCalled()
}

describe('enforceWithAuthHeaderInternal', () => {
  test('should invoke next when authorized (via enforcer)', async () => {
    const mockEnforcer = () => Promise.resolve<Enforce>(async () => true)
    const mockContext = createDefaultMockContext()
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expect(next).toHaveBeenCalled()
  })

  test('should set status to 401 and set body when unauthorized (via enforcer)', async () => {
    const mockEnforcer = () => Promise.resolve<Enforce>(async () => false)
    const mockContext = createDefaultMockContext()
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if enforcer throws', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createDefaultMockContext()
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if no auth header', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createMockContext()
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if not using bearer token', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createMockContext({
      headers: { authorization: `NotBearer ${createToken()}` },
    })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if not using bearer token', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createMockContext({
      headers: { authorization: `NotBearer ${createToken()}` },
    })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if invalid auth header', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createMockContext({
      headers: { authorization: 'totallynotvalid' },
    })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if invalid token', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createMockContext({
      headers: { authorization: 'Bearer totallynotvalid' },
    })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })

  test('should be unauthorized if expired token', async () => {
    const mockEnforcer = () =>
      Promise.resolve<Enforce>(async () => {
        throw 'bad error'
      })
    const mockContext = createMockContext({
      headers: {
        authorization: `Bearer ${sign(
          { userId: 'foo', role: Roles.User },
          getConfig().server.jwtSecret,
        )}`,
      },
    })
    const next = jest.fn()
    await enforceWithAuthHeaderInternal(mockEnforcer)('account', ['viewAny'])(mockContext, next)
    expectUnauthorized(mockContext, next)
  })
})
