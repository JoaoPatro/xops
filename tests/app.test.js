const request = require('supertest');
const app = require('../src/index');

test('GET / returns hello', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.msg).toMatch(/Hello/);
});
