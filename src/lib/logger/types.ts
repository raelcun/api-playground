import * as t from 'io-ts'

export const LogMethodsV = t.union([
  t.literal('trace'),
  t.literal('debug'),
  t.literal('info'),
  t.literal('warn'),
  t.literal('error'),
  t.literal('fatal'),
])
export const LogMethodsWithSilentV = t.union([LogMethodsV, t.literal('silent')])
export type LogMethods = t.TypeOf<typeof LogMethodsV>
export type LogMethodsWithSilent = t.TypeOf<typeof LogMethodsWithSilentV>

export const MessageV = t.intersection([
  t.type({ level: LogMethodsV }),
  t.partial({
    traceId: t.string,
    context: t.string,
    payload: t.partial({
      code: t.string,
      message: t.string,
      subcode: t.string,
      stack: t.string,
      meta: t.object,
    }),
    request: t.intersection([
      t.type({
        url: t.string,
        method: t.string,
      }),
      t.partial({
        body: t.union([t.string, t.object]),
        headers: t.object,
        ip: t.string,
      }),
    ]),
    response: t.intersection([
      t.type({ status: t.number }),
      t.partial({ headers: t.object, body: t.union([t.string, t.object]) }),
    ]),
    timing: t.type({
      type: t.string,
      start: t.string,
      end: t.string,
      duration: t.number,
    }),
  }),
])

export type Message = t.TypeOf<typeof MessageV>

export const LoggingConfigV = t.type({
  prettyPrint: t.boolean,
  level: LogMethodsWithSilentV,
})
export type LoggingConfig = t.TypeOf<typeof LoggingConfigV>

export type Transform = (message: Message) => Message
export interface Logger {
  log(message: Message): void
  transform(transform: Transform): Logger
  defaultValues(message: Omit<Message, 'level'>): Logger
  pinValues(message: Omit<Message, 'level'>): Logger
  child(context: string): Logger
}
export type LoggerProvider = () => Logger
