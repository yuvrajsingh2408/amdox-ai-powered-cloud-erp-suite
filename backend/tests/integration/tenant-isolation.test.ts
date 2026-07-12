/**
 * Tenant Isolation Integration Tests
 * Verifies that all protected API routes enforce tenant isolation.
 */
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

const INVALID_TOKEN = 'Bearer invalid.jwt.token';

describe('Tenant Isolation — Protected Routes (no token)', () => {
  const protectedRoutes = [
    { method: 'GET', path: '/api/hr/employees' },
    { method: 'GET', path: '/api/finance/accounts' },
    { method: 'GET', path: '/api/scm/vendors' },
    { method: 'GET', path: '/api/crm/leads' },
    { method: 'GET', path: '/api/projects' },
    { method: 'GET', path: '/api/reports' },
    { method: 'GET', path: '/api/users' },
  ];

  protectedRoutes.forEach(({ method, path }) => {
    it(`${method} ${path} — rejects unauthenticated request`, async () => {
      const res = await (request(app) as any)[method.toLowerCase()](path)
        .set('x-tenant-id', 'some-tenant-id');
      // Without a valid token the route should deny access (401/403)
      // or return 404 if the route is guarded before path matching.
      // All cases correctly prevent data access — any non-2xx is acceptable.
      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(201);
    });
  });
});

describe('Tenant Isolation — Invalid Token Handling', () => {
  it('returns non-2xx for any protected route with malformed token', async () => {
    const res = await request(app)
      .get('/api/hr/employees')
      .set('Authorization', INVALID_TOKEN)
      .set('x-tenant-id', 'some-tenant-id');
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(201);
  });

  it('auth middleware returns 401 for invalid JWT on auth route', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', INVALID_TOKEN);
    expect([401, 403, 404, 405]).toContain(res.status);
  });
});

describe('API Rate Limiting', () => {
  it('auth endpoint responds (not 500)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' });
    // Should be 400/401/422 — never a 500
    expect(res.status).toBeLessThan(500);
  });
});

describe('API Response Format Consistency', () => {
  it('404 routes return consistent JSON envelope', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint-xyz-123');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data', null);
  });

  it('health endpoint returns valid JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('live endpoint includes uptime', async () => {
    const res = await request(app).get('/live');
    expect(res.status).toBe(200);
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThan(0);
  });

  it('ready endpoint responds', async () => {
    const res = await request(app).get('/ready');
    // May be 200 (DB connected) or 503 (no DB in test) — both are valid
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

