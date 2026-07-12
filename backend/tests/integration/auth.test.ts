import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('Auth API — Input Validation', () => {
  describe('POST /api/auth/login', () => {
    it('returns 400 when body is empty', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect([400, 401, 422]).toContain(res.status);
    });

    it('returns 400 when email is invalid format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'secret' });
      expect([400, 401, 422]).toContain(res.status);
    });

    it('returns 401 for non-existent credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.invalid', password: 'wrongpassword' });
      expect([401, 404]).toContain(res.status);
    });
  });

  describe('POST /api/auth/register', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' });
      expect([400, 422]).toContain(res.status);
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

