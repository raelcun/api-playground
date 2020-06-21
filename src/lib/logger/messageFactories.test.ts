import { Context } from 'koa'

import { createMockContext } from '@shopify/jest-koa-mocks'

import { createTimingMessageSegment, getMessageFromContext } from './messageFactories'

const createContext = (): Context => {
  const requestBody = { foo: 'bar' }
  const responseBody = { fizz: 'buzz' }
  const context: Context = createMockContext({
    requestBody,
    headers: {
      foo: 'bar',
    },
  })
  context.response.status = 200
  context.response.body = responseBody
  context.set('fizz', 'buzz')

  return context
}

describe('log message factories', () => {
  describe('getMessageFromContext', () => {
    test.each([
      ['when options are defaulted', undefined],
      ['when request options is true', { request: true, response: false }],
      ['when response options is true', { request: false, response: true }],
      ['when request and response is false', { request: false, response: false }],
      ['when request and response is true', { request: true, response: true }],
    ])('should set message properties %s', (_, options) => {
      expect(getMessageFromContext(createContext(), options)).toMatchSnapshot()
    })
  })

  test('createTimingMessageSegment', () => {
    const time = new Date()
    const message = createTimingMessageSegment(process.hrtime.bigint(), time, 'MOCK_TIMING')
    expect(message.type).toEqual('MOCK_TIMING')
    expect(message.start).toEqual(time.toISOString())
    expect(time.getTime() - Date.parse(message.end)).toBeGreaterThanOrEqual(0)
    expect(time.getTime() - Date.parse(message.end)).toBeLessThan(20)
    expect(message.duration).toBeGreaterThan(0)
  })
})
