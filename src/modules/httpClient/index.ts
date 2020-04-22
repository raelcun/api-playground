import Axios from 'axios'

import { request as defaultRequest } from './request'

export const request = defaultRequest(
  Axios.create({
    validateStatus: () => true,
  }),
)
