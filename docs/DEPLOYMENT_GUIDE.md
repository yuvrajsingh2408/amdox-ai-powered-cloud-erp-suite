# Amdox ERP — Production Deployment Guide

## Overview

This guide covers production deployment of Amdox ERP using Docker Compose (single-server) or Kubernetes (multi-node HA).

---

## Pre-Deployment Checklist

- [ ] `.env` file configured with production values
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are minimum 64 characters
- [ ] `POSTGRES_PASSWORD` set to strong password (min 16 chars)
- [ ] `CORS_ORIGINS` set to your exact frontend domain
- [ ] SSL certificates obtained (Let's Encrypt or purchased)
- [ ] Firewall rules: ports 80, 443 open; 5432, 6379 blocked externally
- [ ] Backup strategy configured
- [ ] Monitoring alerts configured (email/Slack in alertmanager.yml)

---

## Docker Compose Deployment

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB SSD | 200 GB NVMe |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Step 1: Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# Verify
docker --version && docker compose version
```

### Step 2: Clone Repository

```bash
git clone https://github.com/your-org/amdox-erp.git
cd amdox-erp
```

### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env

# Required production values:
# NODE_ENV=production
# JWT_SECRET=<64-char random string>
# JWT_REFRESH_SECRET=<64-char random string>
# POSTGRES_PASSWORD=<strong password>
# CORS_ORIGINS=https://yourdomain.com
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: SSL Certificate

```bash
# Install certbot
sudo apt install certbot -y

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy to nginx ssl directory
sudo mkdir -p infra/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem infra/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem infra/nginx/ssl/
sudo chown -R $USER:$USER infra/nginx/ssl/

# Auto-renew cron
echo "0 12 * * * certbot renew --quiet && docker compose restart nginx" | sudo crontab -
```

### Step 5: Deploy

```bash
# Production deployment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Verify all services are healthy
docker compose ps

# Initialize database (first deploy only)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

### Step 6: Verify

```bash
# Health checks
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/ready
curl https://api.yourdomain.com/live

# View logs
docker compose logs -f backend --tail=100
```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or kubeadm)
- kubectl v1.28+
- Helm v3+
- Nginx Ingress Controller installed
- cert-manager installed (for automatic TLS)

### Deploy

```bash
# 1. Create namespace and secrets
kubectl apply -f k8s/namespace.yaml

kubectl create secret generic amdox-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@postgres:5432/amdox_erp' \
  --from-literal=JWT_SECRET='your-64-char-secret' \
  --from-literal=JWT_REFRESH_SECRET='your-64-char-refresh-secret' \
  --from-literal=REDIS_PASSWORD='your-redis-password' \
  --namespace=amdox-erp

# 2. Apply manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml

# 3. Monitor rollout
kubectl rollout status deployment/amdox-backend -n amdox-erp --timeout=300s

# 4. Run database migrations
kubectl exec -n amdox-erp deployment/amdox-backend -- npx prisma migrate deploy
```

---

## Zero-Downtime Rolling Updates

### Docker Compose
```bash
# Pull latest images
docker compose pull

# Rolling restart (update one at a time)
docker compose up -d --no-deps --build backend
docker compose up -d --no-deps --build frontend
```

### Kubernetes
```bash
# Update image tag
kubectl set image deployment/amdox-backend backend=ghcr.io/your-org/amdox-erp-backend:v1.1.0 -n amdox-erp

# Monitor
kubectl rollout status deployment/amdox-backend -n amdox-erp
```

---

## Backup & Recovery

### Automated Database Backup

```bash
# Manual backup
docker compose exec db pg_dump -U postgres amdox_erp | gzip > backup_$(date +%Y%m%d_%H%M).sql.gz

# Cron backup (daily at 2am, keep 30 days)
cat >> /etc/cron.d/amdox-backup << 'EOF'
0 2 * * * root docker compose -f /opt/amdox-erp/docker-compose.yml exec -T db pg_dump -U postgres amdox_erp | gzip > /backups/amdox_$(date +\%Y\%m\%d).sql.gz && find /backups -name "amdox_*.sql.gz" -mtime +30 -delete
EOF
```

### Restore
```bash
# Decompress and restore
gunzip < backup_20260101.sql.gz | docker compose exec -T db psql -U postgres amdox_erp
```

---

## Monitoring Access

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Application | https://yourdomain.com | (as configured) |
| Grafana | https://yourdomain.com:3001 | admin / (from .env) |
| Prometheus | Internal only | — |
| Alertmanager | Internal only | — |

---

## Firewall Configuration

```bash
# Allow only required external ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Database and Redis should NEVER be exposed externally
# They communicate only on the Docker internal network
```

---

## Performance Tuning

### PostgreSQL
```bash
# Add to docker-compose.yml under db service command:
command: postgres -c max_connections=200 -c shared_buffers=256MB -c effective_cache_size=1GB
```

### Redis
```bash
# Already configured in docker-compose.yml:
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Node.js
```bash
# In backend Dockerfile CMD or docker-compose.yml:
NODE_OPTIONS=--max-old-space-size=1024
```
