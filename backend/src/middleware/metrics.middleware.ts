import client from 'prom-client';
import { Request, Response, NextFunction, Router } from 'express';

// ─── Registry ─────────────────────────────────────────────────────────────
const register = new client.Registry();
register.setDefaultLabels({ app: 'amdox-erp', env: process.env.NODE_ENV || 'development' });
client.collectDefaultMetrics({ register });

// ─── Custom Metrics ────────────────────────────────────────────────────────
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

export const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// ─── Middleware ────────────────────────────────────────────────────────────
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  activeConnections.inc();
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    activeConnections.dec();
    const route = req.route?.path || req.path || 'unknown';
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    end(labels);
    httpRequestTotal.inc(labels);
  });
  next();
};

// ─── Metrics Endpoint ─────────────────────────────────────────────────────
export const metricsRouter = Router();
metricsRouter.get('/', async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export { register };
