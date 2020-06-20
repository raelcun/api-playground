import { Lazy } from 'fp-ts/lib/function'
import { Next } from 'koa'

import { createMockLogger, installStaticClock } from '@lib/test-utils'
import { createKoaContext, createMockNext } from '@modules/utils'

import { createMiddleware } from './middleware'

const eatError = async <T>(fn: Lazy<Promise<T>>) => {
  try {
    await fn()
  } catch {}
}

const createMockMiddleware = () => {
  const mockLogger = createMockLogger()
  const mockInfo = mockLogger.info as ReturnType<typeof jest.fn>
  const mockContext = createKoaContext({ url: 'MOCK_URL', method: 'GET' })
  const middleware = createMiddleware(() => mockLogger)

  return {
    mockInfo,
    mockContext,
    callMiddleware: (next: Next) => middleware(mockContext, next),
  }
}

describe('logRequestMiddleware', () => {
  const getClock = installStaticClock()

  test('log should match snapshot when next throws', async () => {
    const { callMiddleware, mockInfo, mockContext } = createMockMiddleware()
    const mockNext = createMockNext(() => {
      getClock().tick(1)
      mockContext.status = 500
      throw new Error()
    })
    await eatError(callMiddleware(mockNext))
    expect(mockInfo.mock.calls[0][0]).toMatchSnapshot()
  })

  test('log should match snapshot when next succeeds', async () => {
    const { callMiddleware, mockInfo, mockContext } = createMockMiddleware()
    const mockNext = createMockNext(() => {
      getClock().tick(1)
      mockContext.status = 200
      throw new Error()
    })
    await eatError(() => callMiddleware(mockNext))
    expect(mockInfo.mock.calls[0][0]).toMatchSnapshot()
  })

  test('should pass through error', async () => {
    expect.assertions(1)

    const { callMiddleware } = createMockMiddleware()
    const mockNext = createMockNext(() => {
      throw new Error('foobar')
    })

    try {
      await callMiddleware(mockNext)
    } catch (e) {
      expect(e.message).toEqual('foobar')
    }
  })
})
