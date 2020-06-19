export * from './types'
import { v4 as uuid } from 'uuid'

import packageJson from '@root/../package.json'

import { ErrorResponse, SuccessResponse } from './types'

export const createErrorResponse = (error: ErrorResponse['error']): ErrorResponse => ({
  id: uuid(),
  apiName: packageJson.name,
  apiVersion: packageJson.version,
  sha: process.env.GITHUB_SHA,
  error,
})

export const createSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  id: uuid(),
  apiName: packageJson.name,
  apiVersion: packageJson.version,
  sha: process.env.GITHUB_SHA,
  data,
})
