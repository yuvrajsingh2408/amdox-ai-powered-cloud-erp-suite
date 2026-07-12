# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production --ignore-scripts
RUN npm ci
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

# ─── Stage 2: Production Runtime ──────────────────────────────────────────
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

WORKDIR /app

# Copy production node_modules and compiled output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create required directories
RUN mkdir -p logs uploads \
  && chown -R appuser:nodejs /app

USER appuser

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
