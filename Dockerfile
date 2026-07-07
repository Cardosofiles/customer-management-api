# syntax=docker/dockerfile:1

# Multi-stage production image for the Fastify API.
# - Build once with the full toolchain, ship only dist/ + production deps.
# - tsup externalizes runtime dependencies and inlines the generated Prisma
#   client (schema embedded), so src/generated is not needed at runtime.

ARG NODE_VERSION=22

# ── Base: Node + pnpm via corepack ────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ── Install all dependencies (layer cached by the lockfile) ───────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ── Build: generate the Prisma client, then bundle with tsup ──────────────────
FROM base AS build
# Dummy value: `prisma generate` reads DATABASE_URL from prisma.config.ts but
# never connects. The real value is injected at runtime.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate && pnpm build

# ── Production dependencies only ──────────────────────────────────────────────
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

# ── Runner: minimal, non-root runtime ─────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PORT=3333
WORKDIR /app

# dumb-init gives the app a real init as PID 1 (signal forwarding + zombie reaping).
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init \
  && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Run as the unprivileged user that ships with the official Node image.
USER node

EXPOSE 3333

# Container-level liveness: the orchestrator restarts the app if /health fails.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3333)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
