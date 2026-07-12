# Amdox ERP — AI-Powered Cloud ERP Suite

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-20.x-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Kubernetes](https://img.shields.io/badge/kubernetes-ready-326CE5)

**Enterprise-grade, AI-powered, multi-tenant SaaS ERP platform built for scale.**

[Documentation](./docs) • [API Reference](./docs/API.md) • [Deployment Guide](./docs/DEPLOYMENT.md) • [Architecture](./docs/ARCHITECTURE.md)

</div>

---

## 🚀 Overview

Amdox ERP is a full-stack enterprise resource planning suite with 14+ modules, AI-powered features, and production-grade DevOps infrastructure.

### ✅ Implemented Modules

| Module | Status |
|--------|--------|
| Authentication & RBAC | ✅ Production |
| HR & Payroll | ✅ Production |
| Finance & Accounting | ✅ Production |
| Supply Chain & Inventory | ✅ Production |
| CRM | ✅ Production |
| Project Management | ✅ Production |
| AI Forecasting & BI | ✅ Production |
| Reports & Analytics | ✅ Production |
| AI Copilot (ERP Chat) | ✅ Production |
| Document Management | ✅ Production |
| Notification Center | ✅ Production |
| Workflow Automation | ✅ Production |
| Customer & Vendor Portals | ✅ Production |
| Security & Compliance | ✅ Production |
| System Administration | ✅ Production |

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Recharts, Lucide |
| **Backend** | Node.js 20, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **AI Service** | Python FastAPI |
| **Container** | Docker, Docker Compose |
| **Orchestration** | Kubernetes, Helm |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Prometheus, Grafana, Loki, Alertmanager |
| **API Docs** | OpenAPI 3.0 / Swagger UI |
| **Auth** | JWT with refresh token rotation |

---

## ⚡ Quick Start (Development)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/amdox-erp.git
cd amdox-erp
cp .env.example .env
# Edit .env with your values
```

### 2. Start with Docker Compose

```bash
docker compose up --build
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs (Swagger)**: http://localhost:5000/api-docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)

### 3. Local Development (without Docker)

```bash
# Start backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm run test:unit

# Backend integration tests
cd backend && npm run test:integration

# Full coverage report
cd backend && npm run test:coverage
```

---

## 🐳 Docker

```bash
# Development stack
docker compose up --build

# Production stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check health
docker compose ps
```

---

## ☸️ Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml   # Edit with real secrets first!
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml
```

---

## 📊 Monitoring

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Grafana | :3001 | admin / admin123 |
| Prometheus | :9090 | — |
| Alertmanager | :9093 | — |
| Loki | :3100 | — |

---

## 📚 Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Developer Guide](./docs/DEVELOPER.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

---

## 🔒 Security

- JWT with refresh token rotation
- RBAC (Role-Based Access Control)
- Multi-tenancy with data isolation
- Helmet security headers
- CSP (Content Security Policy)
- Rate limiting (global + per-route)
- CORS origin whitelist
- Audit log trail

---

## 📄 License

MIT © 2026 Amdox Technologies
