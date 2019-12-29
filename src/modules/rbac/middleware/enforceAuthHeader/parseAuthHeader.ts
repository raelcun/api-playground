import { either as E } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { verify } from 'jsonwebtoken'

import { ConfigProvider } from '@config/types'
import { Err } from '@modules/error/types'
import { decode } from '@utils'

import { Token, tokenV } from '../types'

export const resolveAuthHeader = (headers: unknown): E.Either<Err, string> => {
  const getAuthHeader = (headers: unknown): E.Either<Err, string> =>
    pipe(
      decode(t.type({ authorization: t.string }), headers),
      E.mapLeft(() => ({ code: 'INVALID_AUTH_HEADER', message: 'invalid auth header format' })),
      E.map(({ authorization }) => authorization),
    )

  const parseAuthHeaderParts = (parts: string[]): E.Either<Err, [string, string]> => {
    if (parts.length !== 2)
      return E.left({ code: 'INVALID_AUTH_HEADER', message: 'requires two parts' })
    if (parts[0] !== 'Bearer')
      return E.left({ code: 'INVALID_AUTH_HEADER', message: 'first part must be "Bearer"' })

    return E.right([parts[0], parts[1]])
  }

  return pipe(
    getAuthHeader(headers),
    E.map(authorization => authorization.split(' ')),
    E.chain(parseAuthHeaderParts),
    E.map(([, token]) => token),
  )
}

export const verifyAndParseToken = (configProvider: ConfigProvider) => (
  token: string,
): E.Either<Err, Token> =>
  pipe(
    E.tryCatch(
      () => verify(token, configProvider().server.jwtSecret),
      () => ({ code: 'INVALID_TOKEN', message: 'failed to decode token' }),
    ),
    E.chain(tokenPayload =>
      pipe(
        decode(tokenV, tokenPayload),
        E.mapLeft(() => ({ code: 'INVALID_TOKEN', message: 'token payload format invalid' })),
      ),
    ),
  )
