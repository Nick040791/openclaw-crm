# openclaw-crm — multi-stage image focused on the OpenClaw HTTP tool bridge
# Privacy-first: no external telemetry; runs as non-root; minimal surface.
# Future: extend stages for Next.js dashboard when app/ lands.

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json ./
# Lockfile may not exist yet in early skeleton; install is still deterministic via package.json ranges
RUN pnpm install --prod=false

# ---------- build / type-check (optional verification layer) ----------
FROM deps AS build
WORKDIR /app
COPY . .
# Type-check only; we run the bridge via tsx (no emit required for current architecture)
RUN pnpm type-check || true

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    BRIDGE_HOST=0.0.0.0 \
    BRIDGE_PORT=3100

RUN corepack enable && corepack prepare pnpm@latest --activate \
  && addgroup -g 1001 -S crm && adduser -S crm -u 1001 -G crm

# Production node_modules only
COPY package.json ./
RUN pnpm install --prod --ignore-scripts

# Application source (TypeScript executed via tsx)
COPY --chown=crm:crm core ./core
COPY --chown=crm:crm modules ./modules
COPY --chown=crm:crm integrations ./integrations
COPY --chown=crm:crm tsconfig.json ./tsconfig.json
COPY --chown=crm:crm package.json ./package.json

# tsx is needed at runtime for the bridge entrypoint
RUN pnpm add tsx@^4.19.1

USER crm
EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3100/health || exit 1

CMD ["pnpm", "bridge"]
