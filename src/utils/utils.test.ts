import { either as E, taskEither as TE } from 'fp-ts'
import { Err } from '@modules/error/types'
import { LogMethods } from '@modules/logger/types'
import { getSystemLogger } from '@modules/logger'
import * as t from 'io-ts'
import * as KoaMocks from '@shopify/jest-koa-mocks'
import {
  DateFromString,
  createMiddlewareTE,
  createKoaContext,
  createMockNext,
  mapErrorCode,
  logErrors,
  decode,
  createMiddlewareE,
} from './utils'

describe('DateFromString', () => {
  test.each<string | number>([
    '2019/1/1',
    '2019-1-1',
    '2019-10-10T14:48:00',
    'Wed, 09 Aug 1995 00:00:00 GMT',
    '2019-10-10T14:48:00.000+09:00',
    1565484560,
  ])('should successfully validate %s', date => {
    expect(E.isRight(DateFromString.decode(date))).toBe(true)
  })

  test.each<unknown>(['foo-bar', '23/25/2014', null, undefined])(
    'should fail to validate %s',
    date => {
      expect(DateFromString.is(date)).toBe(false)
      expect(E.isLeft(DateFromString.decode(date))).toBe(true)
    },
  )

  test('should successfully encode', () => {
    expect(DateFromString.encode(new Date('2019/1/1'))).toBe('2019-01-01T05:00:00.000Z')
  })
})

describe('createMiddlewareTE', () => {
  test('should call next on right', async () => {
    const mockNext = createMockNext()
    await createMiddlewareTE(() => TE.right('foo'))(createKoaContext(), mockNext)
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  test('should not call next on left', async () => {
    const mockNext = createMockNext()
    await createMiddlewareTE(() => TE.left('foo'))(createKoaContext(), mockNext)
    expect(mockNext).toHaveBeenCalledTimes(0)
  })
})

describe('createMiddlewareE', () => {
  test('should call next on right', async () => {
    const mockNext = createMockNext()
    await createMiddlewareE(() => E.right('foo'))(createKoaContext(), mockNext)
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  test('should not call next on left', async () => {
    const mockNext = createMockNext()
    await createMiddlewareE(() => E.left('foo'))(createKoaContext(), mockNext)
    expect(mockNext).toHaveBeenCalledTimes(0)
  })
})

describe('mapErrorCode', () => {
  test('should return initial error with updated error code', () => {
    const newErrorCode = 'newCode'
    const existingError: Err = {
      code: 'old code',
      message: 'old message',
    }
    expect(mapErrorCode(newErrorCode)(E.left(existingError))).toMatchSnapshot()
  })

  test('should do nothing for E.right', () => {
    const e = E.right('foo')
    expect(mapErrorCode('newCode')(e)).toEqual(e)
  })
})

describe('logErrors', () => {
  test.each<LogMethods>(['trace', 'info', 'error'])(
    'should invoke %s method on logger with error',
    method => {
      const logger = getSystemLogger()
      const spy = jest.spyOn(logger, method)

      logErrors(logger, method)(E.left({ code: 'foo' }))

      expect(spy.mock.calls).toMatchSnapshot()
    },
  )

  test('should pass error through', () => {
    const e = E.left({ code: 'foo' })
    expect(logErrors(getSystemLogger())(e)).toEqual(e)
  })

  test('should do nothing for E.right', () => {
    const logger = getSystemLogger()
    const spy = jest.spyOn(logger, 'trace')
    logErrors(logger, 'trace')(E.right('foo'))
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('decode', () => {
  test('should return type when valid input', () => {
    const input: unknown = 'foo'
    expect(decode(t.string, input)).toEqual(E.right(input))
  })

  test('should return validation error when invalid input', () => {
    const input: unknown = 5
    expect(decode(t.string, input)).toMatchSnapshot()
  })

  test('should report all errors joined together', () => {
    const input: unknown = { foo: 'foo', bar: 5 }
    expect(decode(t.type({ foo: t.number, bar: t.string }), input)).toMatchSnapshot()
  })
})

describe('createKoaContext', () => {
  test('should wrap createMockContext', () => {
    const spy = jest.spyOn(KoaMocks, 'createMockContext')
    createKoaContext({ requestBody: 'foo' })
    expect(spy.mock.calls).toMatchSnapshot()
  })

  test('should set body if passed', () => {
    const context = createKoaContext({ body: 'foo' })
    expect(context.body).toEqual('foo')
  })
})
