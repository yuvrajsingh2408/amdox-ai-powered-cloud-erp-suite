# Architecture Overview — Amdox ERP

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│   Browser → React 18 SPA (Vite, TypeScript, Recharts, Lucide)      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS
┌────────────────────────────────▼────────────────────────────────────┐
│                        NGINX REVERSE PROXY                          │
│         TLS Termination • Rate Limiting • Load Balancing            │
└──────┬──────────────────────────────────────────────────┬───────────┘
       │ /api/*                                            │ /*
┌──────▼──────────────┐                        ┌──────────▼──────────┐
│   BACKEND (Node.js) │                        │  FRONTEND (Nginx)   │
│   Express + Prisma  │                        │  React Static Files │
│   TypeScript        │                        │  Gzip + Cache       │
│   JWT Auth / RBAC   │                        └─────────────────────┘
│   Prometheus /metrics│
│   Swagger /api-docs  │
└──────┬──────┬────────┘
       │      │
┌──────▼──┐ ┌─▼──────────┐   ┌─────────────────┐
│PostgreSQL│ │   Redis 7  │   │  AI Service     │
│ Prisma   │ │  Caching   │   │  Python FastAPI │
│ Multi-   │ │  Sessions  │   │  ML Models      │
│ tenant   │ │  Rate Lmt  │   └─────────────────┘
└──────────┘ └────────────┘
```

## Module Architecture

### Multi-Tenancy
Every database query is scoped by `tenantId`. The `tenant.middleware.ts` extracts tenant context from `x-tenant-id` or subdomain headers.

### RBAC
Roles: `SUPER_ADMIN → ADMIN → MANAGER → EMPLOYEE → READ_ONLY`

Permissions are enforced at the route level via `requireAuth` and `requireRole` middleware.

### Authentication Flow
```
Login → JWT Access Token (15m) + Refresh Token (7d, httpOnly cookie)
     → Protected routes: Bearer token in Authorization header
     → Refresh: POST /api/auth/refresh → new access token
```

### Database Schema
- ~100+ Prisma models across 15 modules
- All models include: `id`, `tenantId`, `createdAt`, `updatedAt`
- Soft deletes via `deletedAt` where needed

## Directory Structure

```
amdox-erp/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── app.ts            # Express app setup
│   │   ├── server.ts         # Entry point + graceful shutdown
│   │   ├── config/           # DB, env, swagger config
│   │   ├── controllers/      # Request handlers (thin layer)
│   │   ├── middleware/       # Auth, tenant, error, metrics
│   │   ├── routes/           # Express Router definitions
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access layer
│   │   ├── utils/            # Logger, helpers
│   │   └── types/            # TypeScript type definitions
│   ├── prisma/               # Prisma schema + migrations + seed
│   └── tests/                # Jest unit & integration tests
│       ├── unit/
│       └── integration/
│
├── frontend/                 # React 18 SPA
│   ├── src/
│   │   ├── App.tsx           # Root + router
│   │   ├── context/          # Auth context
│   │   ├── components/       # Shared UI components
│   │   └── pages/            # Page components (one per route)
│   ├── vite.config.ts        # Build config with chunk splitting
│   └── nginx.conf            # SPA container Nginx config
│
├── ai-service/               # Python FastAPI ML service
├── infra/                    # Infrastructure config
│   └── nginx/                # Reverse proxy config
├── k8s/                      # Kubernetes manifests
├── monitoring/               # Prometheus, Grafana, Loki config
├── .github/workflows/        # CI/CD pipelines
└── docs/                     # Documentation
```

## Data Flow

```
HTTP Request
→ Nginx (TLS, rate limit)
→ Express (request-id, logging, auth middleware)
→ tenant.middleware.ts (tenant context injection)
→ Route handler
→ Controller (validate input)
→ Service (business logic)
→ Repository / Prisma (database query, scoped by tenantId)
→ Response
```

## Monitoring Stack

```
Backend App → Prometheus (metrics scrape every 10s)
           → Loki (structured JSON logs via log shipping)
           → Grafana (dashboards + alert visualization)
           → Alertmanager (routing → Email / Slack)
```
