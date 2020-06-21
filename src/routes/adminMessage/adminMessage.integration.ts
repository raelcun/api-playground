import HttpStatus from 'http-status-codes'
import request from 'supertest'

import { createValidAdminTokenHeader, createValidUserTokenHeader } from '@modules/test-utils'
import { app } from '@root/app'

const createResponseMatcher = (extra: Record<string, unknown> = {}) => ({
  id: expect.any(String),
  apiVersion: expect.any(String),
  ...extra,
})

describe('adminMessage', () => {
  test('should return body when authorized', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .set('Authorization', createValidAdminTokenHeader())
      .send({
        message: 'foobar',
      })
      .expect(HttpStatus.OK)
      .expect(res => expect(res.body).toMatchSnapshot(createResponseMatcher()))
  })

  test('should reject unauthorized request ', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .set('Authorization', createValidUserTokenHeader())
      .send({
        message: 'foobar',
      })
      .expect(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })

  test('should validate post body', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .set('Authorization', createValidAdminTokenHeader())
      .expect(HttpStatus.BAD_REQUEST)
      .expect(res => expect(res.body).toMatchSnapshot(createResponseMatcher()))
  })
})
