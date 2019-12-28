import { taskEither as TE } from 'fp-ts'
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { BaseRequestClient, RequestError } from './types'

export const request = (instance: BaseRequestClient) => <T>(
  config: AxiosRequestConfig,
): TE.TaskEither<RequestError, AxiosResponse<T>> =>
  TE.tryCatch<RequestError, AxiosResponse<T>>(
    (): Promise<AxiosResponse<T>> => instance.request<T>(config),
    (e: AxiosError): RequestError =>
      e.code === 'ECONNABORTED' ? { code: 'TIMEOUT' } : { code: 'NETWORK_ERROR' },
  )
