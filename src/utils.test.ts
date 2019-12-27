import { either as E, taskEither as TE } from 'fp-ts'
import { DateFromString, createMiddlewareTE, createKoaContext, createMockNext } from './utils'

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
