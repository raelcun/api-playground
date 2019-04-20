import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { app } from '../app'

describe('adminThing', () => {
  test('should return correct body', async () => {
    await request(app.callback())
      .post('/adminThing')
      .send({
        role: 'admin',
      })
      .expect(200)
  })

  test('should enforce ', async () => {
    await request(app.callback())
      .post('/adminThing')
      .send({
        role: 'admin',
      })
      .expect(200)
  })

  test('should validate post body', async () => {
    await request(app.callback())
      .post('/adminThing')
      .send({})
      .expect(HttpStatus.BAD_REQUEST)
  })
})
