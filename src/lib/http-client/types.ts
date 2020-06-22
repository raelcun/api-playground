import { AxiosInstance } from 'axios'

export interface BaseRequestClient {
  request: AxiosInstance['request']
}
