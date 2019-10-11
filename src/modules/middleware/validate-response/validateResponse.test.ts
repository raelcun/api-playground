import * as t from 'io-ts'
import { createMockContext } from '@shopify/jest-koa-mocks'
import { validateResponseInner } from './validateResponse'

describe('validate-response', () => {
  test('should call next on invalid response when shouldThrow is false', async () => {
    const next = jest.fn()
    const ctx = createMockContext()
    ctx.body = 'foo'

    await validateResponseInner(false)(t.number)(ctx, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  test('should not call next on invalid response when shouldThrow is true', async () => {
    const next = jest.fn()
    const ctx = createMockContext()
    ctx.body = 'foo'

    await validateResponseInner(true)(t.number)(ctx, next)

    expect(next).not.toHaveBeenCalled()
  })

  test('should set error context on invalid response when shouldThrow is true', async () => {
    const ctx = createMockContext()
    ctx.body = 'foo'

    await validateResponseInner(true)(t.number)(ctx, jest.fn())

    expect(ctx.status).toEqual(500)
    expect(ctx.body).toEqual({ errors: ['Expecting number but instead got: "foo".'] })
  })

  test('should call next on valid response', async () => {
    const next = jest.fn()
    const ctx = createMockContext()
    ctx.body = 5

    await validateResponseInner(false)(t.number)(ctx, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})
