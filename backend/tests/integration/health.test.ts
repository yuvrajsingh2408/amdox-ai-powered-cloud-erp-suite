import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('Health & Probe Endpoints', () => {
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('amdox-erp-backend');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /live', () => {
    it('returns 200 with alive status', async () => {
      const res = await request(app).get('/live');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('alive');
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  describe('GET /metrics', () => {
    it('returns prometheus metrics in text format', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/plain/);
      expect(res.text).toContain('http_requests_total');
    });
  });
});

describe('API 404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Security Headers', () => {
  it('includes x-request-id header in every response', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('includes x-content-type-options header from Helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

