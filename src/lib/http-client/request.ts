import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { taskEither as TE } from 'fp-ts'
import { pipe } from 'fp-ts/lib/function'

import { Err } from '@lib/error'
import { logErrorsTE, LoggerProvider } from '@lib/logger'
import { tryCatchTE } from '@lib/utils'

import { BaseRequestClient } from './types'

export const request = (instance: BaseRequestClient) => <T>(
  config: AxiosRequestConfig,
  getLogger: LoggerProvider,
): TE.TaskEither<Err, AxiosResponse<T>> => {
  getLogger().log({
    level: 'trace',
    payload: { message: 'making http request', meta: { config } },
  })

  return pipe(
    tryCatchTE<Err, AxiosResponse<T>>(
      () => instance.request<T>(config),
      (e: AxiosError | Err): Err => ({
        code: e.code || 'UNKNOWN_HTTP_ERROR',
        message: e.message,
      }),
    ),
    logErrorsTE(getLogger(), 'error'),
  )
}
