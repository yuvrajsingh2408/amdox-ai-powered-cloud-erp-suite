# System Architecture — Amdox ERP

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3)
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         NGINX REVERSE PROXY                                  │
│   TLS Termination • HSTS • Rate Limiting • Gzip • Security Headers           │
│   HTTP→HTTPS redirect • SPA fallback • Upstream keepalive                   │
└──────────────────────┬──────────────────────────────┬────────────────────────┘
                       │ /api/*                        │ /*
        ┌──────────────▼──────────────┐    ┌──────────▼──────────┐
        │        BACKEND CLUSTER       │    │   FRONTEND CLUSTER   │
        │   Node.js 20 + Express 4    │    │   Nginx + React SPA  │
        │   TypeScript + Prisma ORM   │    │   Vite-built assets  │
        │   JWT Auth + RBAC           │    │   Lazy-loaded routes │
        │   Multi-tenant isolation    │    └─────────────────────┘
        │   Prometheus /metrics        │
        │   Winston JSON logging       │
        │   Graceful shutdown          │
        └──────┬──────────────┬────────┘
               │              │
    ┌──────────▼───┐    ┌─────▼───────┐    ┌──────────────┐
    │  PostgreSQL  │    │   Redis 7   │    │  AI Service  │
    │  16 (Prisma) │    │  Cache +    │    │  Python +    │
    │  Multi-tenant│    │  Sessions + │    │  FastAPI +   │
    │  Row-level   │    │  Rate Limit │    │  ML Models   │
    │  isolation   │    └─────────────┘    └──────────────┘
    └──────────────┘
```

## 2. Backend Architecture (Layered)

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────────┐
│          MIDDLEWARE STACK (app.ts)        │
│  1. Static Files                         │
│  2. Compression (gzip)                   │
│  3. Request ID (x-request-id trace)      │
│  4. Helmet (Security Headers + CSP)      │
│  5. CORS (origin whitelist)              │
│  6. Cookie Parser                        │
│  7. Body Parsers (JSON, urlencoded)      │
│  8. Auth Rate Limiter (20/15min)         │
│  9. Global Rate Limiter (300/15min)      │
│ 10. Prometheus Metrics                   │
│ 11. Request Logger (Winston)             │
│ 12. Health / Ready / Live Probes         │
│ 13. Tenant Middleware (context inject)   │
│ 14. Swagger Docs (dev only)              │
│ 15. API Router (/api/v1 + /api legacy)   │
│ 16. 404 Handler                          │
│ 17. Abuse Detection                      │
│ 18. Global Error Handler                 │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────┐
│    CONTROLLERS   │  ← Thin layer: parse request, call service, return response
└────────┬─────────┘
         │
┌────────▼─────────┐
│    SERVICES      │  ← Business logic, validation, orchestration
└────────┬─────────┘
         │
┌────────▼─────────┐
│  REPOSITORIES    │  ← Data access layer (Prisma queries, always tenant-scoped)
└────────┬─────────┘
         │
┌────────▼─────────┐
│  PRISMA ORM      │  ← Type-safe queries to PostgreSQL
└──────────────────┘
```

## 3. Frontend Architecture

```
React 18 SPA (Vite-built)
├── src/
│   ├── App.tsx              ← Route configuration (React.lazy + Suspense)
│   ├── context/
│   │   └── AuthContext.tsx  ← Auth state (JWT token, user, tenant)
│   ├── components/
│   │   └── common/
│   │       ├── Layout.tsx   ← Sidebar + Header + Outlet
│   │       └── Sidebar.tsx  ← Navigation tree
│   └── pages/               ← 146 lazy-loaded page components
│       ├── Dashboard.tsx
│       ├── HR*.tsx
│       ├── Finance*.tsx
│       └── ...
```

### Bundle Strategy
| Chunk | Contents | Gzipped |
|-------|----------|---------|
| `vendor-react` | React, React-DOM, Router | ~54 KB |
| `vendor-charts` | Recharts, D3 | ~87 KB |
| `vendor-icons` | Lucide React | ~9 KB |
| `vendor-http` | Axios | ~18 KB |
| `vendor` | Other dependencies | ~26 KB |
| `index` | Application code | ~138 KB |

## 4. Database Architecture

### Multi-Tenancy Model
Every table includes a `tenantId` (UUID) column. All Prisma queries include `WHERE tenantId = $tenantId` — enforced at the service/repository layer.

### Core Models (simplified)

```
Tenant (1) ──────── (many) User
User (1) ───────── (many) Employee
Employee (1) ────── (many) LeaveRequest
Employee (1) ────── (many) Attendance
Employee (1) ────── (many) Payslip
```

### Relationship Patterns

```
Tenant
├── Users (RBAC roles)
├── Employees (HR)
│   ├── LeaveRequests
│   ├── Attendance records
│   └── Payslips
├── Accounts (Finance COA)
│   ├── JournalEntries
│   ├── Invoices (AR)
│   └── Bills (AP)
├── Vendors (SCM)
│   ├── PurchaseOrders
│   └── GoodsReceipts
├── Products → Inventory
├── Leads → Clients (CRM)
├── Projects → Tasks
├── Documents → Folders
├── Workflows → WorkflowInstances
└── Reports → ReportTemplates
```

## 5. Authentication & Authorization Flow

```
[Client] POST /api/auth/login
    │
    ▼
[authController] validates credentials
    │
    ├── bcrypt.compare(password, hash)
    │
    ├── JWT Access Token (15 min, signed with JWT_SECRET)
    │
    └── JWT Refresh Token (7 days, stored in DB, httpOnly cookie)

[Protected Request]
    Authorization: Bearer <access_token>
    x-tenant-id: <tenant-uuid>
    │
    ▼
[auth.middleware] verifies JWT signature + expiry
    │
    ▼
[tenant.middleware] injects req.tenantId from header/JWT
    │
    ▼
[rbac.middleware] checks user.role >= required role
    │
    ▼
[controller] → [service] → [repository (tenant-scoped)]
```

## 6. CI/CD Pipeline

```
Git Push → GitHub Actions
│
├── ci.yml (on every push/PR)
│   ├── TypeScript check (backend + frontend)
│   ├── Jest unit + integration tests
│   ├── Production build verification
│   └── npm audit --audit-level=high
│
├── docker.yml (on main merge / tag)
│   ├── Multi-platform Docker build (amd64, arm64)
│   ├── Push to GHCR (tagged: semver + sha + latest)
│   └── SBOM generation
│
├── deploy.yml (on version tag)
│   ├── Manifest validation
│   ├── K8s rolling update with image tag injection
│   ├── Smoke test (health + ready endpoints)
│   └── Auto rollback on failure
│
└── release.yml (on version tag)
    ├── git-cliff changelog generation
    └── GitHub Release creation
```

## 7. Monitoring Architecture

```
Backend App
    │ Prometheus client (prom-client)
    ▼
GET /metrics → Prometheus (scrapes every 10s)
                │
                ├── Grafana Dashboards (visualization)
                ├── Alertmanager (routing → Email/Slack)
                └── Rules (7 alert definitions)

Backend App → Winston JSON logs → stdout
    │ (collected by log shipper)
    ▼
Loki (log aggregation) → Grafana (log visualization)
```

## 8. Security Architecture

| Layer | Control | Implementation |
|-------|---------|----------------|
| Transport | TLS 1.3 only | Nginx + cert-manager |
| Headers | Security headers | Helmet (CSP, HSTS, XFO) |
| Auth | JWT + Refresh rotation | express-jwt + custom service |
| Authorization | RBAC | Role hierarchy middleware |
| Multi-tenancy | Tenant isolation | Prisma scoped queries |
| Rate limiting | Tiered limits | express-rate-limit |
| CSRF | Double-submit cookie | csrf.middleware.ts |
| Abuse | Error rate detection | abuseDetection.middleware.ts |
| Network | Pod-level isolation | K8s NetworkPolicy |
| Secrets | Never in code/git | K8s Secrets / env vars |
| Audit | Full audit trail | AuditLog Prisma model |
