import request from 'supertest'
import { app } from '@root/app'

describe('healthcheck', () => {
  test('should return 200', async () => {
    await request(app.callback())
      .get('/v1/healthcheck')
      .expect(200)
  })
})
