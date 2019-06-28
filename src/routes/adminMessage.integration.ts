import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { app } from '../app'

describe('adminMessage', () => {
  test('should return correct body', async () => {
    await request(app.callback())
      .post('/adminMessage')
      .send({
        role: 'admin',
      })
      .expect(200)
  })

  test('should enforce ', async () => {
    await request(app.callback())
      .post('/adminMessage')
      .send({
        role: 'admin',
      })
      .expect(200)
  })

  test('should validate post body', async () => {
    await request(app.callback())
      .post('/adminMessage')
      .send({})
      .expect(HttpStatus.BAD_REQUEST)
  })
})
