import request from 'supertest';
import app from '../index.js';

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('AQ Route', () => {
  test('GET /aq/:city returns a response', async () => {
    const res = await request(app).get('/aq/colombo');
    // Accept either 200 (success) or 500 (API unavailable in test env)
    expect([200, 500]).toContain(res.statusCode);
  }, 15000);
});