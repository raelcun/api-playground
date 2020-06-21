import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createMockLogger } from '@lib/test-utils'

import { createDynamoClient } from './dynamo-client'

const createMockDocumentClient = (impl: {
  put: () => Promise<Record<string, unknown>>
  delete: () => Promise<Record<string, unknown>>
}): Pick<DocumentClient, 'put' | 'delete'> => ({
  put: jest.fn().mockImplementation(() => ({ promise: impl.put })),
  delete: jest.fn().mockImplementation(() => ({ promise: impl.delete })),
})

const createSuccessfulDocumentClient = (
  options = { putResult: { foo: 'bar' }, deleteResult: { foo: 'bar' } },
) =>
  createMockDocumentClient({
    put: () => Promise.resolve({ $response: options.putResult }),
    delete: () => Promise.resolve({ $response: options.deleteResult }),
  })

const createUnsuccessfulDocumentClient = (
  options = {
    putResult: { code: 'AWS_ERROR', message: 'aws error' },
    deleteResult: { code: 'AWS_ERROR', message: 'aws error' },
  },
) =>
  createMockDocumentClient({
    put: () => Promise.reject(options.putResult),
    delete: () => Promise.reject(options.deleteResult),
  })

describe('dynamo client', () => {
  describe('put', () => {
    test('should log each request', async () => {
      const mockLogger = createMockLogger()
      const logSpy = jest.spyOn(mockLogger, 'log')
      const dynamoClient = createDynamoClient(createSuccessfulDocumentClient())(() => mockLogger)

      const params = { TableName: 'foo', Item: { foo: 'bar' } }
      await dynamoClient.put(params)()

      expect(logSpy).toHaveBeenCalledWith({
        level: 'trace',
        payload: {
          message: 'putting document',
          meta: { params },
        },
      })
    })

    test('should log expected errors', async () => {
      const mockLogger = createMockLogger()
      const logSpy = jest.spyOn(mockLogger, 'log')
      const dynamoClient = createDynamoClient(createUnsuccessfulDocumentClient())(() => mockLogger)

      await dynamoClient.put({ TableName: 'foo', Item: { foo: 'bar' } })()

      expect(logSpy).toHaveBeenCalledWith({
        level: 'error',
        payload: {
          code: 'DYNAMO_CLIENT_ERROR',
          message: 'aws error',
          subcode: 'AWS_ERROR',
        },
      })
    })

    test('should log exceptions', async () => {
      const mockLogger = createMockLogger()
      const logSpy = jest.spyOn(mockLogger, 'log')
      const dynamoClient = createDynamoClient({
        put: jest.fn().mockImplementation(() => {
          throw new Error('explode')
        }),
        delete: jest.fn(),
      })(() => mockLogger)

      await dynamoClient.put({ TableName: 'foo', Item: { foo: 'bar' } })()

      expect(logSpy).toHaveBeenCalledWith({
        level: 'error',
        payload: {
          code: 'DYNAMO_CLIENT_ERROR',
          message: 'explode',
          subcode: 'UNKNOWN_ERROR',
        },
      })
    })
  })

  describe('delete', () => {
    test('should log each request', async () => {
      const mockLogger = createMockLogger()
      const logSpy = jest.spyOn(mockLogger, 'log')
      const dynamoClient = createDynamoClient(createSuccessfulDocumentClient())(() => mockLogger)

      const params = { TableName: 'tasks', Key: { id: 'foo' } }
      await dynamoClient.delete(params)()

      expect(logSpy).toHaveBeenCalledWith({
        level: 'trace',
        payload: {
          message: 'deleting document',
          meta: { params },
        },
      })
    })

    test('should log expected errors', async () => {
      const mockLogger = createMockLogger()
      const logSpy = jest.spyOn(mockLogger, 'log')
      const dynamoClient = createDynamoClient(createUnsuccessfulDocumentClient())(() => mockLogger)

      await dynamoClient.delete({ TableName: 'tasks', Key: { id: 'foo' } })()

      expect(logSpy).toHaveBeenCalledWith({
        level: 'error',
        payload: {
          code: 'DYNAMO_CLIENT_ERROR',
          message: 'aws error',
          subcode: 'AWS_ERROR',
        },
      })
    })

    test('should log exceptions', async () => {
      const mockLogger = createMockLogger()
      const logSpy = jest.spyOn(mockLogger, 'log')
      const dynamoClient = createDynamoClient({
        put: jest.fn(),
        delete: jest.fn().mockImplementation(() => {
          throw new Error('explode')
        }),
      })(() => mockLogger)

      await dynamoClient.delete({ TableName: 'tasks', Key: { id: 'foo' } })()

      expect(logSpy).toHaveBeenCalledWith({
        level: 'error',
        payload: {
          code: 'DYNAMO_CLIENT_ERROR',
          message: 'explode',
          subcode: 'UNKNOWN_ERROR',
        },
      })
    })
  })
})
