# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Production Nginx ────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy compiled React build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: run as non-root
RUN addgroup --system --gid 1001 nginx-user \
  && adduser --system --uid 1001 --ingroup nginx-user nginx-user \
  && chown -R nginx-user:nginx-user /usr/share/nginx/html \
  && chown -R nginx-user:nginx-user /var/cache/nginx \
  && chown -R nginx-user:nginx-user /var/log/nginx \
  && touch /var/run/nginx.pid \
  && chown nginx-user:nginx-user /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
