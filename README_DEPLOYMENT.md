# Amdox ERP — Quick Deployment Reference

## ⚡ Fastest Path: Docker Compose

```bash
# 1. Clone
git clone https://github.com/your-org/amdox-erp.git && cd amdox-erp

# 2. Configure
cp .env.example .env
# Edit .env: set JWT_SECRET, POSTGRES_PASSWORD, CORS_ORIGINS

# 3. Generate secure secrets (run twice — one per secret)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 4. Start entire stack
docker compose up -d --build

# 5. Initialize database
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# 6. Verify
curl http://localhost:5000/health && echo "Backend OK"
curl http://localhost:3000 && echo "Frontend OK"
```

Access:
- **App**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/api-docs
- **Grafana**: http://localhost:3001

---

## 🌐 Production (with SSL)

```bash
# Get SSL certificate
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy to nginx ssl dir
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem infra/nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem infra/nginx/ssl/

# Production deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## ☸️ Kubernetes (HA Cluster)

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Secrets (never commit real values)
kubectl create secret generic amdox-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=JWT_SECRET='64-char-secret' \
  --from-literal=JWT_REFRESH_SECRET='64-char-refresh-secret' \
  -n amdox-erp

# 3. Deploy all
kubectl apply -f k8s/ -n amdox-erp

# 4. Watch rollout
kubectl rollout status deployment/amdox-backend -n amdox-erp

# 5. Run migrations
kubectl exec -n amdox-erp deployment/amdox-backend -- npx prisma migrate deploy
```

---

## ♻️ Rolling Updates (Zero Downtime)

```bash
# Docker Compose
docker compose pull
docker compose up -d --no-deps --build backend frontend

# Kubernetes
kubectl set image deployment/amdox-backend \
  backend=ghcr.io/your-org/amdox-erp-backend:v1.x.x -n amdox-erp
```

---

## 🔍 Verify Production Health

```bash
curl https://api.yourdomain.com/health          # { status: "ok" }
curl https://api.yourdomain.com/ready           # { status: "ready", database: "connected" }
curl https://api.yourdomain.com/live            # { status: "alive", uptime: N }
curl https://api.yourdomain.com/metrics         # Prometheus text format
```

---

## 📋 Minimum .env for Production

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:CHANGE_ME@db:5432/amdox_erp
REDIS_URL=redis://redis:6379
JWT_SECRET=64-char-random-string-here
JWT_REFRESH_SECRET=different-64-char-random-string-here
CORS_ORIGINS=https://yourdomain.com
COOKIE_SECRET=another-random-secret

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_DB=amdox_erp
```

---

## 🔧 Troubleshooting

| Problem | Command |
|---------|---------|
| Check all services | `docker compose ps` |
| View backend logs | `docker compose logs -f backend` |
| Check DB connection | `docker compose exec db psql -U postgres -c "SELECT 1"` |
| Restart single service | `docker compose restart backend` |
| View K8s pod logs | `kubectl logs -n amdox-erp -l app=amdox-backend -f` |
| K8s pod status | `kubectl get pods -n amdox-erp` |

For detailed guides see [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

---

## 🗄️ Backup

```bash
# Backup
docker compose exec db pg_dump -U postgres amdox_erp | \
  gzip > backup_$(date +%Y%m%d_%H%M).sql.gz

# Restore
gunzip < backup.sql.gz | docker compose exec -T db psql -U postgres amdox_erp
```
