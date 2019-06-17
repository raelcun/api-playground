import request from 'supertest'
import { app } from '../app'

describe('healthcheck', () => {
  test('should return correct body', async () => {
    await request(app.callback())
      .get('/healthcheck')
      .expect(200)
  })
})
