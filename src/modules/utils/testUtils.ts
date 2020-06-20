import * as HttpStatus from 'http-status-codes'
import { Context } from 'koa'

import { install, InstalledClock } from '@sinonjs/fake-timers'

export const testUnauthorized = (mockContext: Context, mockNext: jest.Mock<Promise<void>, []>) => {
  test('should set status to 401', () => {
    expect(mockContext.status).toEqual(HttpStatus.UNAUTHORIZED)
  })

  test('should not invoke next', () => {
    expect(mockNext).not.toHaveBeenCalled()
  })
}

export const testAuthorized = (mockContext: Context, mockNext: jest.Mock<Promise<void>, []>) => {
  test('should not set status to 401', () => {
    expect(mockContext.status).not.toEqual(HttpStatus.UNAUTHORIZED)
  })

  test('should invoke next once', () => {
    expect(mockNext).toHaveBeenCalledTimes(1)
  })
}

/* istanbul ignore next */
export const installStaticClock = () => {
  let clock: InstalledClock

  beforeAll(() => {
    clock = install({ now: 946684800000 })
  })

  afterAll(() => {
    clock.uninstall()
  })

  return () => clock
}
