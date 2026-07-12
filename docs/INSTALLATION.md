# Installation Guide — Amdox ERP

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disk | 20 GB | 50+ GB SSD |
| Node.js | 20 LTS | 20.x latest |
| PostgreSQL | 16 | 16 |
| Redis | 7 | 7 |
| Docker | 24 | Latest |

---

## Installation Methods

### Method 1: Docker Compose (Recommended)

Fastest way to get a full working stack running.

```bash
# 1. Clone
git clone https://github.com/your-org/amdox-erp.git
cd amdox-erp

# 2. Configure
cp .env.example .env
# Edit .env — minimum required values:
#   JWT_SECRET=<64+ random chars>
#   JWT_REFRESH_SECRET=<64+ random chars>
#   POSTGRES_PASSWORD=<secure password>

# 3. Start
docker compose up --build -d

# 4. Initialize database
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# 5. Verify
curl http://localhost:5000/health
```

**All services start automatically:**
- Frontend → http://localhost:3000
- API → http://localhost:5000
- Swagger → http://localhost:5000/api-docs
- Grafana → http://localhost:3001

---

### Method 2: Local Development

```bash
# Prerequisites
node -v   # v20+
psql --version  # 16+

# 1. Clone
git clone https://github.com/your-org/amdox-erp.git
cd amdox-erp
cp .env.example .env

# 2. Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev     # Runs on :5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev     # Runs on :3000
```

---

## First Login

After seeding, default admin credentials are:

```
Email:    admin@amdox.io
Password: Admin@123!
```

> ⚠️ **Change this password immediately** in production.

---

## Configuration Reference

The `.env` file controls all runtime behavior. Critical settings:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | **Minimum 64 characters** |
| `JWT_REFRESH_SECRET` | ✅ | **Minimum 64 characters** |
| `CORS_ORIGINS` | ✅ | Frontend URL (no trailing slash) |
| `NODE_ENV` | ✅ | `production` in prod |
| `REDIS_URL` | ⚪ | Optional — improves performance |
| `SMTP_*` | ⚪ | Required for email features |

---

## Verify Installation

Run these checks to confirm everything is working:

```bash
# API health
curl http://localhost:5000/health

# Readiness (checks DB connection)
curl http://localhost:5000/ready

# Metrics
curl http://localhost:5000/metrics | grep http_requests_total

# Backend tests
cd backend && npm test

# Frontend build
cd frontend && npm run build
```

---

## Upgrade

```bash
git pull origin main
docker compose pull
docker compose up -d --no-deps --build backend frontend
docker compose exec backend npx prisma migrate deploy
```

---

## Uninstall

```bash
# Stop and remove containers + volumes (⚠️ removes all data)
docker compose down -v

# Or keep data, just stop services
docker compose down
```
