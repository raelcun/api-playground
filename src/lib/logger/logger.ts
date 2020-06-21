import pino from 'pino'

import { LoggingConfig, Message } from '@lib/logger'

import { Logger, Transform } from './types'

const createBaseLogger = (log: (message: Message) => void): Logger => {
  const transform = (transform: Transform): Logger =>
    createBaseLogger(message => log(transform(message)))

  const defaultValues = (message: Partial<Message>) =>
    transform(tMessage => ({
      ...message,
      ...tMessage,
      payload: {
        ...message.payload,
        ...tMessage.payload,
      },
    }))

  const pinValues = (message: Omit<Message, 'level'>) =>
    transform(tMessage => ({
      ...tMessage,
      ...message,
      payload: {
        ...tMessage.payload,
        ...message.payload,
      },
    }))

  const child = (context: string) =>
    transform(tMessage => ({
      ...tMessage,
      parentContext: tMessage.context,
      context: context,
    }))

  return {
    log,
    transform,
    defaultValues,
    pinValues,
    child,
  }
}

export const createLogger = (configProvider: () => LoggingConfig) => {
  const pinoLogger = pino({
    name: 'logger',
    level: configProvider().level,
    prettyPrint: configProvider().prettyPrint,
  })
  return createBaseLogger(({ level, ...message }) => pinoLogger[level](message))
}
