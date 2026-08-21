# ==============================================================================
# SMARTSCHOOL RDC - DOCKERFILE DE PRODUCTION MULTI-STAGE
# ==============================================================================

# STAGE 1: Build Phase
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json bun.lock* package-lock.json* ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy source code
COPY . .

# Build production assets and bundle server
ENV NODE_ENV=production
RUN npm run build

# STAGE 2: Production Execution Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install minimal production system utilities
RUN apk add --no-co-cache curl tzdata && \
    cp /usr/share/zoneinfo/Africa/Kinshasa /etc/localtime && \
    echo "Africa/Kinshasa" > /etc/timezone

# Copy compiled dist bundle and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user for security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser -S smartschool -u 1001 -G nodejs && \
    mkdir -p /app/backups && \
    chown -R smartschool:nodejs /app

USER smartschool

EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
