# Deployment Guide — Amdox ERP

## Production Deployment Options

### Option A: Docker Compose (Recommended for single-server)
### Option B: Kubernetes (Recommended for high availability)
### Option C: Managed Cloud (Fly.io, Railway, Render, etc.)

---

## Option A: Docker Compose Deployment

### Prerequisites
- Ubuntu 22.04+ VPS (min 4 vCPU, 8 GB RAM)
- Docker Engine 24+
- Docker Compose 2.x
- Domain name with DNS pointed to server IP

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

### 2. Clone & Configure

```bash
git clone https://github.com/your-org/amdox-erp.git
cd amdox-erp
cp .env.example .env
nano .env  # Fill in all production values
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone -d app.yourdomain.com -d api.yourdomain.com

# Certificates are at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Copy to infra/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem infra/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem infra/nginx/ssl/

# Auto-renewal cron
sudo crontab -e
# Add: 0 12 * * * certbot renew --quiet && docker compose restart nginx
```

### 4. Deploy

```bash
# Production deployment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Seed initial data (first time only)
docker compose exec backend npx prisma db seed

# Check status
docker compose ps
docker compose logs -f backend
```

### 5. Health Check

```bash
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/ready
curl https://api.yourdomain.com/live
```

---

## Option B: Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or self-managed)
- kubectl configured
- cert-manager installed
- Nginx Ingress Controller installed

### 1. Create Secrets

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets (never commit real values)
kubectl create secret generic amdox-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@postgres:5432/amdox_erp' \
  --from-literal=JWT_SECRET='your-strong-64-char-secret' \
  --from-literal=JWT_REFRESH_SECRET='your-strong-64-char-refresh-secret' \
  --from-literal=REDIS_PASSWORD='your-redis-password' \
  --namespace=amdox-erp
```

### 2. Apply Manifests

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml
```

### 3. Monitor Rollout

```bash
kubectl rollout status deployment/amdox-backend -n amdox-erp
kubectl rollout status deployment/amdox-frontend -n amdox-erp
kubectl get pods -n amdox-erp -w
```

---

## CI/CD Automated Deployment

Push to `main` branch triggers:
1. TypeScript type-check (backend + frontend)
2. Unit + integration tests
3. Docker build + push to GHCR
4. Kubernetes rolling update

See `.github/workflows/ci.yml` and `.github/workflows/docker.yml`.

---

## Backup & Disaster Recovery

### PostgreSQL Backup

```bash
# Manual backup
docker compose exec db pg_dump -U postgres amdox_erp > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U postgres amdox_erp < backup_20260101.sql
```

### Automated Backup (cron)

```bash
# Add to crontab
0 2 * * * docker compose exec -T db pg_dump -U postgres amdox_erp | gzip > /backups/amdox_$(date +\%Y\%m\%d).sql.gz

# Upload to S3
0 3 * * * aws s3 sync /backups/ s3://your-bucket/db-backups/
```

---

## Rolling Updates (Zero Downtime)

```bash
# Pull latest images
docker compose pull

# Rolling restart (prod compose)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps frontend
```
