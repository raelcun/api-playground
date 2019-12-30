import * as t from 'io-ts'

export const ErrV = t.intersection([t.type({ code: t.string }), t.partial({ message: t.string })])

export interface Err<T extends string = string> {
  code: T
  message?: string
}
