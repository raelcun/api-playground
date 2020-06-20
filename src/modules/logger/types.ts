import * as t from 'io-ts'
import { Bindings } from 'pino'

type LogFn = (message: Message) => void
export type Logger = {
  trace: LogFn
  debug: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
  fatal: LogFn
  child: (bindings: Pick<Bindings, 'level' | 'serializers'> & Message) => Logger
}

export const MessageV = t.partial({
  traceId: t.string,
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
})

export type Message = t.TypeOf<typeof MessageV>

export type LoggerFactory = () => Logger

export const LogMethodsV = t.union([
  t.literal('trace'),
  t.literal('debug'),
  t.literal('info'),
  t.literal('warn'),
  t.literal('error'),
  t.literal('fatal'),
])
export type LogMethods = t.TypeOf<typeof LogMethodsV>

export const LoggingConfigV = t.type({
  prettyPrint: t.boolean,
  level: LogMethodsV,
})
export type LoggingConfig = t.TypeOf<typeof LoggingConfigV>
