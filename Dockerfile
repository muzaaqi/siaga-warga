# Multi-stage Dockerfile for SiagaWarga (TanStack Start + Bun Runtime)
FROM docker.io/oven/bun:1-alpine AS base
WORKDIR /app

# Stage 1: Install production dependencies
FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Stage 2: Install all dependencies and build
FROM base AS builder
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV NODE_ENV=production
RUN bun run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Use bun non-root user
USER bun

# Copy dependencies, built assets, and runtime scripts
COPY --from=prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --from=builder --chown=bun:bun /app/server.ts ./server.ts
COPY --from=builder --chown=bun:bun /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["bun", "run", "server.ts"]
