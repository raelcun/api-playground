import HttpStatus from 'http-status-codes'
import request from 'supertest'

import { app } from '@root/app'

describe('adminMessage', () => {
  test('should return body when authorized', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .send({
        role: 'admin',
        message: 'foobar',
      })
      .expect(HttpStatus.OK, 'foobar')
  })

  test('should reject unauthorized request ', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .send({
        role: 'user',
        message: 'foobar',
      })
      .expect(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })

  test('should validate post body', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .send({ role: 'admin' })
      .expect(HttpStatus.BAD_REQUEST, {
        code: 'BODY_VALIDATION_ERROR',
        message: 'Expecting string at message but instead got: undefined.',
      })
  })
})
