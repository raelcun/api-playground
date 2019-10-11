import { createMockContext } from '@shopify/jest-koa-mocks'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { rateLimitMiddleware } from './middleware'

describe('rate-limiter middleware', () => {
  describe('passes rate limiter', () => {
    const mockContext = createMockContext()
    const nextMock = jest.fn()
    const limiter = new RateLimiterMemory({ points: 2, duration: 100 })
    const result = rateLimitMiddleware(limiter, () => 'foo')(mockContext, nextMock)

    test('sets X-RateLimit-Remaining header', async () => {
      await result
      expect(mockContext.response.get('X-RateLimit-Remaining')).toBe('1')
    })

    test('sets X-RateLimit-Reset header', async () => {
      await result
      expect(Number.parseInt(mockContext.response.get('X-RateLimit-Reset'))).toBeGreaterThan(0)
    })

    test('invokes next middleware', async () => {
      await result
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('fails rate limiter', () => {
    const mockContext = createMockContext()
    const nextMock = jest.fn()
    const limiter = new RateLimiterMemory({ points: 0, duration: 100 })
    const result = rateLimitMiddleware(limiter, () => 'foo')(mockContext, nextMock)

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
})
