import { KoaContext } from '@modules/api-core'
import { createMockContext, Options } from '@shopify/jest-koa-mocks'

export const createKoaContext = <T>(
  options?: Options<Record<string, unknown>, T> & { requestBody?: T } & {
    body?: string | Record<string, unknown>
  },
): KoaContext<T> => {
  const context = createMockContext(options) as KoaContext<T>
  if (options !== undefined && options.body !== undefined) {
    context.body = options.body
  }
  return context
}

export const createMockNext = (impl = () => {}): jest.Mock<Promise<void>> =>
  jest.fn(() => {
    impl()
    return Promise.resolve()
  })
