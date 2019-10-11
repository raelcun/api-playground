import * as t from 'io-ts'

export const DateFromString = new t.Type<Date, string, unknown>(
  'DateFromString',
  (u): u is Date => u instanceof Date,
  (u, c) =>
    t
      .union([t.string, t.number])
      .validate(u, c)
      .chain(s => {
        const d = new Date(s)
        return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d)
      }),
  a => a.toISOString(),
)
