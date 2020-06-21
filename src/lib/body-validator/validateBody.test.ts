import * as t from 'io-ts'

import { createMockLogger } from '@lib/test-utils'

import { validateBody } from './validateBody'

describe('validateBody', () => {
  describe('when validation is successful', () => {
    test('should return input', () => {
      const result = validateBody(createMockLogger)(t.string)('foo')

      expect(result).toMatchSnapshot()
    })
  })

  describe('when validation is unsuccessful', () => {
    test('should return error', () => {
      const result = validateBody(createMockLogger)(t.string)(5)

      expect(result).toMatchSnapshot()
    })

    test('should log errors', () => {
      const logger = createMockLogger()
      const logSpy = jest.spyOn(logger, 'log')
      validateBody(() => logger)(t.string)(5)

      expect(logSpy.mock.calls).toMatchSnapshot()
    })
  })
})
