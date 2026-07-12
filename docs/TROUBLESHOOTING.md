# Troubleshooting Guide — Amdox ERP

## Common Issues

---

### 1. Database Connection Failures

**Symptom**: `prisma connect ECONNREFUSED` or `ready` endpoint returns 503.

**Solutions**:
```bash
# Check PostgreSQL container is running
docker compose ps db

# Check PostgreSQL logs
docker compose logs db

# Verify DATABASE_URL in .env
grep DATABASE_URL .env

# Test connection manually
docker compose exec db psql -U postgres -d amdox_erp -c "SELECT 1;"

# Regenerate Prisma client
cd backend && npx prisma generate
```

---

### 2. JWT / Authentication Errors

**Symptom**: 401 Unauthorized on protected routes.

**Solutions**:
- Ensure `JWT_SECRET` in `.env` matches what the backend started with
- Tokens expire — check `JWT_EXPIRES_IN` in `.env`
- Clear browser localStorage/sessionStorage and re-login
- Check token format: `Authorization: Bearer <token>`

---

### 3. CORS Errors in Browser Console

**Symptom**: `CORS policy: no 'Access-Control-Allow-Origin'`

**Solutions**:
```bash
# Verify CORS_ORIGINS in backend .env matches frontend URL exactly
CORS_ORIGINS=http://localhost:3000

# Rebuild backend after env change
docker compose up --build backend
```

---

### 4. Prisma Schema Sync Issues

**Symptom**: `P1012` or `P2021` errors (table not found)

**Solutions**:
```bash
# Push schema changes to database
cd backend && npx prisma db push

# Or run migrations
cd backend && npx prisma migrate deploy

# Reset (DEV ONLY — loses all data)
cd backend && npx prisma migrate reset
```

---

### 5. Docker Build Failures

**Symptom**: `COPY failed` or `npm ci failed` during `docker build`

**Solutions**:
```bash
# Clear Docker build cache
docker builder prune -f

# Rebuild without cache
docker compose build --no-cache backend

# Check Docker disk space
docker system df
docker system prune -f
```

---

### 6. Frontend Blank Page / 404 on Refresh

**Symptom**: React app shows blank on direct URL navigation.

**Solution**: Nginx is not configured for SPA fallback. Ensure `nginx.conf` includes:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### 7. Prometheus Metrics Not Appearing

**Symptom**: No data in Grafana dashboards.

**Solutions**:
```bash
# Verify backend /metrics endpoint works
curl http://localhost:5000/metrics

# Check Prometheus targets
open http://localhost:9090/targets

# Verify prometheus.yml scrape config points to correct host
```

---

### 8. High Memory Usage / OOM Kills

**Symptom**: Container restarts, `OOMKilled` in Kubernetes events.

**Solutions**:
- Increase memory limits in `docker-compose.prod.yml` or `k8s/backend-deployment.yaml`
- Check for memory leaks: `npm run test:integration` under load
- Enable Node.js heap dumps: `NODE_OPTIONS=--max-old-space-size=1024`

---

### 9. TypeScript Compilation Errors

**Solutions**:
```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npx tsc --noEmit

# Common: missing types — install @types/package
npm install --save-dev @types/missing-package
```

---

### 10. Rate Limit Errors (429)

**Symptom**: API returns `Too many requests`.

**Solutions**:
- Auth routes: max 20 req/15min per IP
- Global: max 300 req/15min per IP in production
- Increase limits in `backend/src/app.ts` for development

---

## Log Locations

| Service | Location |
|---------|----------|
| Backend logs (Docker) | `docker compose logs backend` |
| Backend logs (file) | `backend/logs/combined.log` |
| Error logs (file) | `backend/logs/error.log` |
| Nginx access | `docker compose logs nginx` |
| Loki (structured) | http://localhost:3100 |
| Grafana (dashboard) | http://localhost:3001 |

---

## Getting Help

1. Check this guide first
2. Review GitHub Issues
3. Check Grafana dashboards for anomalies
4. Review Prometheus alerts at http://localhost:9090/alerts
