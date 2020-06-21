import * as t from 'io-ts'

interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}

export const NonEmptyString = t.brand(
  t.string,
  (s): s is t.Branded<string, NonEmptyStringBrand> => s !== undefined && s.length > 0,
  'NonEmptyString',
)

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type ChangeTypeOfKeys<T, Keys extends keyof T, NewType> = {
  [key in keyof T]: key extends Keys ? NewType : T[key]
}

export type ReplaceReturnType<T extends (...args: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn
