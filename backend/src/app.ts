import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import router from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { abuseDetectionMiddleware } from './middleware/abuseDetection.middleware';
import { csrfMiddleware } from './middleware/csrf.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import logger from './utils/logger';
import { metricsMiddleware, metricsRouter } from './middleware/metrics.middleware';
import path from 'path';

const app = express();

// Trust proxy (required for rate-limit on Windows dev + production load balancers)
app.set('trust proxy', 1);

// ─── Static Files ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── 1. Compression ────────────────────────────────────────────────────────
app.use(compression());

// ─── 2. Request ID (Trace Correlation) ─────────────────────────────────────
app.use((req: any, res, next) => {
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('x-request-id', req.requestId);
  next();
});

// ─── 3. Security Headers (Helmet) ──────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ─── 4. CORS ───────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant-subdomain', 'x-request-id', 'x-csrf-token'],
    exposedHeaders: ['x-request-id', 'x-ratelimit-remaining'],
    credentials: true,
    maxAge: 86400,
  })
);

// ─── 5. Cookie Parser (required for CSRF double-submit) ───────────────────
app.use(cookieParser(process.env.COOKIE_SECRET || 'amdox-cookie-secret'));

// ─── 6. Body Parsers ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── 6b. CSRF Protection ──────────────────────────────────────────────────
app.use(csrfMiddleware);

// ─── 7. Rate Limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    // Normalize IPv6-mapped IPv4 (e.g. ::ffff:127.0.0.1 → 127.0.0.1)
    return ip.replace(/^::ffff:/, '');
  },
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
    data: null,
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  keyGenerator: (req: any) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return ip.replace(/^::ffff:/, '');
  },
  message: {
    success: false,
    message: 'Too many authentication attempts. Try again in 15 minutes.',
    statusCode: 429,
    data: null,
  },
});

app.use('/api/auth', authLimiter);
app.use(globalLimiter);

// ─── 7. Prometheus Metrics ─────────────────────────────────────────────────
app.use(metricsMiddleware);
app.use('/metrics', metricsRouter);

// ─── 8. Structured Request Logger ─────────────────────────────────────────
app.use((req: any, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]({
      type: 'http_request',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      tenantId: req.tenantId || 'global',
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  next();
});

// ─── 9. Health & Readiness Probes ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'amdox-erp-backend',
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/ready', async (_req, res) => {
  try {
    const { default: prisma } = await import('./config/db');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', database: 'disconnected' });
  }
});

app.get('/live', (_req, res) => {
  res.json({ status: 'alive', uptime: process.uptime() });
});

// ─── 10. Tenant Middleware ─────────────────────────────────────────────────
app.use(tenantMiddleware);

// ─── 11. API Docs ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ─── 12. API Routes ───────────────────────────────────────────────────────
app.use('/api/v1', router);
// Legacy support — keep /api working
app.use('/api', router);

// ─── 13. 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', statusCode: 404, data: null });
});

// ─── 14. Abuse Detection (monitors error patterns after routing) ───────────
app.use(abuseDetectionMiddleware);

// ─── 15. Global Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

export default app;
export { app };
