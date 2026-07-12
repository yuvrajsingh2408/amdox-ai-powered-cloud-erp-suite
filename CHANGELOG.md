# Changelog

All notable changes to Amdox ERP are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-07-11

### 🎉 Initial Production Release

#### Added
- **Phase 1**: Backend Foundation — Express, Prisma, JWT Auth, RBAC, Multi-tenancy
- **Phase 2**: HR & Payroll — Employee management, attendance, leave, payroll processing
- **Phase 3**: Finance & Accounting — Chart of accounts, journal entries, AR/AP, bank reconciliation
- **Phase 4**: Supply Chain & Inventory — Vendors, POs, goods receipts, warehouse management
- **Phase 5**: CRM — Leads, clients, opportunities, sales pipeline
- **Phase 6**: Project Management — Projects, tasks, timesheets, Gantt view
- **Phase 7**: AI Forecasting & Business Intelligence — Demand forecasting, BI dashboards
- **Phase 8**: Reports & Analytics Center — Custom report builder, scheduled reports, exports
- **Phase 9**: AI Copilot — Natural language ERP queries, AI insights, executive summaries
- **Phase 10**: Document Management — File upload, folders, versioning, sharing
- **Phase 11**: Notification Center — Push, email, SMS notifications with templates
- **Phase 12**: Workflow Automation & Approval Engine — Visual workflow builder, multi-step approvals
- **Phase 13**: Customer & Vendor Portals — Self-service portals, ticket system, order tracking
- **Phase 14**: Enterprise Security Center & Compliance — MFA, audit trails, GDPR compliance
- **Phase 15**: System Administration & DevOps Center — Admin dashboard, license management, health monitoring
- **Phase 16**: Production Readiness — Docker, Kubernetes, CI/CD, Prometheus, Grafana, Loki

#### Infrastructure
- Multi-stage Docker builds for backend and frontend
- Docker Compose stack with PostgreSQL, Redis, Nginx, Prometheus, Grafana, Loki
- Kubernetes manifests with HPA, NetworkPolicy, and Ingress
- GitHub Actions CI/CD pipelines (CI, Docker publish, Deploy, Release)
- Prometheus metrics endpoint with HTTP histograms and counters
- Winston structured logging (JSON in production)
- Graceful shutdown with SIGTERM/SIGINT handling
- Health (`/health`), readiness (`/ready`), and liveness (`/live`) probes
- Request ID tracing via `x-request-id` headers
- Tiered rate limiting (global + auth-specific)
- CORS hardening with origin whitelist
- CSP, HSTS, and security headers via Helmet

#### Documentation
- README.md with quick start guide
- Architecture documentation with system diagrams
- API reference for all 50+ endpoints
- Installation guide (Docker + local)
- Developer guide with conventions
- Deployment guide (single-server + Kubernetes)
- Troubleshooting guide

---

[1.0.0]: https://github.com/your-org/amdox-erp/releases/tag/v1.0.0
