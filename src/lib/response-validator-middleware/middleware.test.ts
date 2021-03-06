import * as t from 'io-ts'

import { createMockLogger } from '@lib/test-utils'
import { createKoaContext, createMockNext } from '@modules/utils'

import { validateResponseMiddleware } from './middleware'

describe('validate-response', () => {
  test.each([false, true])(
    'should log error when validation fails and shouldThrow is %s',
    async shouldThrow => {
      const logger = createMockLogger()
      const warnLoggerSpy = jest.spyOn(logger, 'warn')
      const next = createMockNext()
      const ctx = createKoaContext({ body: 'foo' })

      await validateResponseMiddleware(
        () => logger,
        () => shouldThrow,
      )(t.number)(ctx, next)

      expect(warnLoggerSpy.mock.calls).toMatchSnapshot()
    },
  )

  test('should call next on invalid response when shouldThrow is false', async () => {
    const next = createMockNext()
    const ctx = createKoaContext({ requestBody: 'foo' })

    await validateResponseMiddleware(createMockLogger, () => false)(t.number)(ctx, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  test('should not call next on invalid response when shouldThrow is true', async () => {
    const next = createMockNext()
    const ctx = createKoaContext({ requestBody: 'foo' })

    await validateResponseMiddleware(createMockLogger, () => true)(t.number)(ctx, next)

    expect(next).not.toHaveBeenCalled()
  })

  test('should have 500 status code when invalid response and shouldThrow is true', async () => {
    const ctx = createKoaContext({ requestBody: 'foo' })

    await validateResponseMiddleware(createMockLogger, () => true)(t.number)(ctx, createMockNext())

    expect(ctx.status).toEqual(500)
  })

  test('should call next on valid response', async () => {
    const next = createMockNext()
    const ctx = createKoaContext({ body: '5' })

    await validateResponseMiddleware(createMockLogger, () => true)(t.string)(ctx, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})
