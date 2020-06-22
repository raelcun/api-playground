import { Err } from '@lib/error'
import { createMockLogger } from '@lib/test-utils'

import { request } from './request'

describe('http-client', () => {
  test('should log each request', async () => {
    const mockAxios: any = { request: jest.fn().mockResolvedValue({}) }
    const mockLogger = createMockLogger()
    const logSpy = jest.spyOn(mockLogger, 'log')

    await request(mockAxios)({ method: 'GET', url: 'foo' }, () => mockLogger)()

    expect(logSpy).toHaveBeenCalledWith({
      level: 'trace',
      payload: {
        message: 'making http request',
        meta: {
          config: {
            method: 'GET',
            url: 'foo',
          },
        },
      },
    })
  })

  test('should log expected errors', async () => {
    const error: Err = { code: 'ERROR', message: 'error message' }
    const mockAxios: any = { request: jest.fn().mockRejectedValue(error) }
    const mockLogger = createMockLogger()
    const logSpy = jest.spyOn(mockLogger, 'log')

    await request(mockAxios)({ method: 'GET', url: 'foo' }, () => mockLogger)()

    expect(logSpy).toHaveBeenCalledWith({
      level: 'error',
      payload: error,
    })
  })

  test('should log exceptions', async () => {
    const mockAxios: any = {
      request: jest.fn().mockImplementation(() => {
        throw new Error('explosion')
      }),
    }
    const mockLogger = createMockLogger()
    const logSpy = jest.spyOn(mockLogger, 'log')

    await request(mockAxios)({ method: 'GET', url: 'foo' }, () => mockLogger)()

    expect(logSpy).toHaveBeenCalledWith({
      level: 'error',
      payload: {
        code: 'UNKNOWN_HTTP_ERROR',
        message: 'explosion',
      },
    })
  })
})
