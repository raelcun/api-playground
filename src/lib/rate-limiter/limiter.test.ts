import { either as E } from 'fp-ts'
import HttpStatus from 'http-status-codes'
import { RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible'

import { installStaticClock } from '@lib/test-utils'
import { createKoaContext } from '@modules/utils'

import { createLimiter, createRateLimiter } from './limiter'

const createMockLimiter = (consumeMock: RateLimiterAbstract['consume']) => {
  const limiter = createLimiter('test')
  jest.spyOn(limiter, 'consume').mockImplementation(consumeMock)
  return limiter
}

const consumeNoPoints: RateLimiterAbstract['consume'] = () =>
  Promise.reject(new RateLimiterRes(0, 500))

const consumeHasPoints: RateLimiterAbstract['consume'] = () =>
  Promise.resolve(new RateLimiterRes(5, 500))

const consumeThrows: RateLimiterAbstract['consume'] = () => Promise.reject(new Error('oh shit'))

describe('rateLimiter', () => {
  installStaticClock()

  test('should set X headers when not throttling request', async () => {
    const limiter = createMockLimiter(consumeHasPoints)
    const context = createKoaContext()
    const setHeaderSpy = jest.spyOn(context, 'set')
    await createRateLimiter(limiter, () => 'foo')(context)()

    expect(setHeaderSpy.mock.calls).toMatchSnapshot()
  })

  test('should set X headers when throttling request', async () => {
    const limiter = createMockLimiter(consumeNoPoints)
    const context = createKoaContext()
    const setHeaderSpy = jest.spyOn(context, 'set')
    await createRateLimiter(limiter, () => 'foo')(context)()

    expect(setHeaderSpy.mock.calls).toMatchSnapshot()
  })

  test('should set status to 429 when throttling request', async () => {
    const limiter = createMockLimiter(consumeNoPoints)
    const context = createKoaContext()
    await createRateLimiter(limiter, () => 'foo')(context)()

    expect(context.status).toBe(HttpStatus.TOO_MANY_REQUESTS)
  })

  test('should return error when throttling request', async () => {
    const limiter = createMockLimiter(consumeNoPoints)
    const result = await createRateLimiter(limiter, () => 'foo')(createKoaContext())()

    expect(result).toEqual(E.left({ code: 'LIMITER_CONSUME_FAILED' }))
  })

  test('should return error and not set headers on unexpected limiter rejection', async () => {
    const limiter = createMockLimiter(consumeThrows)
    const context = createKoaContext()
    const setHeaderSpy = jest.spyOn(context, 'set')
    const result = await createRateLimiter(limiter, () => 'foo')(context)()

    expect(setHeaderSpy.mock.calls).toMatchSnapshot()
    expect(result).toEqual(E.left({ code: 'LIMITER_CONSUME_FAILED' }))
  })
})
