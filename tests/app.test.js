// Importa as dependências necessárias
const request = require('supertest');
const app = require('../src'); // importa o app do index.js

// Teste básico da rota principal "/"
describe('GET /', () => {
  it('deve retornar a mensagem Hello from Sprint 13', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Hello from Sprint 13');
  });
});

// Teste do novo endpoint "/users"
describe('GET /users', () => {
  it('deve retornar uma lista de utilizadores e status 200', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });
});
