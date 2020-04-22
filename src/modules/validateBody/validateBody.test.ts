import * as t from 'io-ts'

import { getSystemLogger } from '@modules/logger'

import { validateBodyInner } from './validateBody'

describe('validateBody', () => {
  describe('when validation is successful', () => {
    test('should return input', () => {
      const result = validateBodyInner(getSystemLogger)(t.string)('foo')

      expect(result).toMatchSnapshot()
    })
  })

  describe('when validation is unsuccessful', () => {
    test('should return error', () => {
      const result = validateBodyInner(getSystemLogger)(t.string)(5)

      expect(result).toMatchSnapshot()
    })

    test('should log errors', () => {
      const logger = getSystemLogger()
      const traceLoggerSpy = jest.spyOn(logger, 'trace')
      validateBodyInner(() => logger)(t.string)(5)

      expect(traceLoggerSpy.mock.calls).toMatchSnapshot()
    })
  })
})
