import { RateLimiterMemory } from 'rate-limiter-flexible'
import { createKoaContext, createMockNext } from 'utils'
import { rateLimitingMiddleware } from './middleware'

describe('rate-limiter middleware', () => {
  describe('when rate limiter passes', () => {
    const mockContext = createKoaContext()
    const nextMock = createMockNext()
    const limiter = new RateLimiterMemory({ points: 2, duration: 100 })
    const result: Promise<void> = rateLimitingMiddleware(limiter, () => 'foo')(
      mockContext,
      nextMock,
    )

    test('decrements and sets X-RateLimit-Remaining header', async () => {
      await result
      expect(mockContext.response.get('X-RateLimit-Remaining')).toBe('1')
    })

    test('decrements and sets X-RateLimit-Reset header', async () => {
      await result
      expect(Number.parseInt(mockContext.response.get('X-RateLimit-Reset'))).toBeGreaterThan(0)
    })

    test('invokes next middleware', async () => {
      await result
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('when rate limiter blocks', () => {
    const mockContext = createKoaContext()
    const nextMock = createMockNext()
    const limiter = new RateLimiterMemory({ points: 0, duration: 100 })
    const result: Promise<void> = rateLimitingMiddleware(limiter, () => 'foo')(
      mockContext,
      nextMock,
    )

    test('status code set to 429', async () => {
      await result
      expect(mockContext.response.status).toBe(429)
    })

    test('sets X-RateLimit-Remaining header', async () => {
      await result
      expect(mockContext.response.get('X-RateLimit-Remaining')).toBe('0')
    })

    test('sets X-RateLimit-Reset header', async () => {
      await result
      expect(Number.parseInt(mockContext.response.get('X-RateLimit-Reset'))).toBeGreaterThan(0)
    })

    test('does not invoke next middleware', async () => {
      await result
      expect(nextMock).toHaveBeenCalledTimes(0)
    })
  })

  test('different keys do not affect each other', async () => {
    const limiter = new RateLimiterMemory({ points: 2, duration: 1000 })
    const mockContextReq1 = createKoaContext()
    const nextMockReq1 = createMockNext()
    const mockContextReq2 = createKoaContext()
    const nextMockReq2 = createMockNext()
    const mockContextReq3 = createKoaContext()
    const nextMockReq3 = createMockNext()

    await rateLimitingMiddleware(limiter, () => 'foo')(mockContextReq1, nextMockReq1)
    expect(mockContextReq1.response.get('X-RateLimit-Remaining')).toEqual('1')
    expect(nextMockReq1).toHaveBeenCalledTimes(1)

    await rateLimitingMiddleware(limiter, () => 'bar')(mockContextReq2, nextMockReq2)
    expect(mockContextReq2.response.get('X-RateLimit-Remaining')).toEqual('1')
    expect(nextMockReq2).toHaveBeenCalledTimes(1)

    await rateLimitingMiddleware(limiter, () => 'foo')(mockContextReq3, nextMockReq3)
    expect(mockContextReq3.response.get('X-RateLimit-Remaining')).toEqual('0')
    expect(nextMockReq3).toHaveBeenCalledTimes(1)
  })
})
