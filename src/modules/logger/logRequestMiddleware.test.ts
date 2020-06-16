import { Lazy } from 'fp-ts/lib/function'
import { Next } from 'koa'

import { Logger } from '@modules/logger/types'
import { createKoaContext, createMockNext, installStaticClock } from '@root/utils'

import { createMiddleware } from './logRequestMiddleware'

const createMockLogger = (): Logger => ({
  info: jest.fn(),
  fatal: jest.fn(),
  trace: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  child: jest.fn(),
})

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

  // let mockInfo: ReturnType<typeof jest.fn>
  // let callMiddleware: (mockNext: Next) => Promise<void>

  // beforeEach(async () => {
  //   const mockLogger = createMockLogger()
  //   mockInfo = mockLogger.info as ReturnType<typeof jest.fn>
  //   const mockContext = createKoaContext({ url: 'MOCK_URL', method: 'GET' })

  //   callMiddleware = mockNext => createMiddleware(() => mockLogger)(mockContext, mockNext)
  // })

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
