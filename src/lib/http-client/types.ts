import { AxiosInstance } from 'axios'

export type RequestError = { code: 'TIMEOUT' } | { code: 'NETWORK_ERROR' }
export interface BaseRequestClient {
  request: AxiosInstance['request']
}
