import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { app } from 'app'

describe('adminMessage', () => {
  test('should return body when authorized', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .send({
        role: 'admin',
        message: 'foobar',
      })
      .expect(200)
  })

  test('should reject unauthorized request ', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .send({
        role: 'user',
        message: 'foobar',
      })
      .expect(401)
  })

  test('should validate post body', async () => {
    await request(app.callback())
      .post('/v1/adminMessage')
      .send({ role: 'admin' })
      .expect(HttpStatus.BAD_REQUEST)
  })
})
