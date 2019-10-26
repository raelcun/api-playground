import * as t from 'io-ts'
import { createMockContext } from '@shopify/jest-koa-mocks'
import HttpStatus from 'http-status-codes'
import { Middleware } from '../../types'
import { createMockLogger } from '../logger'
import { withValidatedBodyInner } from './withValidatedBody'

describe('validateRequestBody', () => {
  describe('when validation is successful', () => {
    test('should invoke wrapped middleware', async () => {
      expect.assertions(1)

      const wrappedMiddleware: Middleware<number> = async ctx => {
        expect(typeof ctx.request.body).toEqual('number')
      }

      const middleware = withValidatedBodyInner(createMockLogger())(t.number)(wrappedMiddleware)

      await middleware(createMockContext({ requestBody: 5 }), jest.fn())
    })
  })

  describe('when validation is unsuccessful', () => {
    const wrappedMiddleware = jest.fn()
    const context = createMockContext({ requestBody: '5' })
    const loggerOverrides = { trace: jest.fn() }

    beforeAll(async () => {
      const middleware = withValidatedBodyInner(createMockLogger(loggerOverrides))(t.number)(
        wrappedMiddleware,
      )

      await middleware(context, jest.fn())
    })

    test('should not invoke wrapped middleware', () => {
      expect(wrappedMiddleware).not.toHaveBeenCalled()
    })

    test('should have a status code of 400', () => {
      expect(context.status).toEqual(HttpStatus.BAD_REQUEST)
    })

    test('should have a body with error message', () => {
      expect(context.body).toMatchSnapshot()
    })

    test('should have logged validation error', () => {
      expect(loggerOverrides.trace.mock.calls[0][0]).toMatchSnapshot()
      expect(loggerOverrides.trace.mock.calls[0][1]).toMatchSnapshot()
    })
  })
})
