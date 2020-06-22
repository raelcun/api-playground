import * as HttpStatus from 'http-status-codes'
import { Context } from 'koa'

import { Logger } from '@lib/logger'
import { install, InstalledClock } from '@sinonjs/fake-timers'

export const createMockLogger = (): Logger => ({
  log: jest.fn(),
  transform: jest.fn(),
  defaultValues: jest.fn(),
  pinValues: jest.fn(),
  child: jest.fn(),
})

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
