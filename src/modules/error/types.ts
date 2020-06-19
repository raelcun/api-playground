import * as t from 'io-ts'

export const createErrV = <C extends t.StringC, SC extends t.StringC>(code: C, subcode: SC) =>
  t.intersection([
    t.type({
      code,
    }),
    t.partial({
      subcode,
      message: t.string,
    }),
  ])

export interface Err<C extends string = string, SC extends string = string> {
  code: C
  subcode?: SC
  message?: string
}
