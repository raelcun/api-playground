import * as t from 'io-ts'

import { createErrV } from '@modules/error/types'

const commonResponseV = t.intersection([
  t.type({
    id: t.string,
    apiName: t.string,
    apiVersion: t.string,
  }),
  t.partial({ sha: t.string }),
])

export const createSuccessResponseV = <C extends t.Mixed>(codec: C) =>
  t.intersection([
    commonResponseV,
    t.type({
      data: codec,
    }),
  ])
export type SuccessResponse<T> = t.TypeOf<typeof commonResponseV> & { data: T }

export const errorResponseV = t.intersection([
  commonResponseV,
  t.type({
    error: t.intersection([
      createErrV(t.string, t.string),
      t.partial({ errors: createErrV(t.string, t.string) }),
    ]),
  }),
])
export type ErrorResponse = t.TypeOf<typeof errorResponseV>

export const createResponseV = <C extends t.Mixed>(codec: C) =>
  t.union([createSuccessResponseV(codec), errorResponseV])
