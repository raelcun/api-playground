import * as t from 'io-ts'
import { createMockContext } from '@shopify/jest-koa-mocks'
import Koa from 'koa'
import HttpStatus from 'http-status-codes'
import { Middleware } from '../../types'
import { withValidatedBody } from './withValidatedBody'

describe('validateRequestBody', () => {
  test('validate body middleware wrapper success', () => {
    expect.assertions(1)

    const middleware: Middleware<number> = async ctx => {
      expect(typeof ctx.request.body).toEqual('number')
    }

    const wrappedMiddleware = withValidatedBody(t.number)(middleware)

    const ctx = createMockContext({ requestBody: 5 })
    wrappedMiddleware(ctx, jest.fn())
  })

  test('validate body middleware wrapper failure', () => {
    expect.assertions(3)

    const middleware: Middleware<{
      foo: { bar: string }
    }> = jest.fn()
    const wrappedMiddleware = withValidatedBody(t.type({ foo: t.type({ bar: t.string }) }))(
      middleware,
    )

    const ctx: Koa.Context = createMockContext({
      requestBody: { foo: { bar: 5 } },
    })
    wrappedMiddleware(ctx, jest.fn())

    expect(middleware).not.toHaveBeenCalled()
    expect(ctx.status).toEqual(HttpStatus.BAD_REQUEST)
    expect(ctx.body).toMatchSnapshot()
  })
})
