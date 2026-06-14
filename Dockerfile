# Multi-stage build for the Wapsell landing.
# Stage 1: install + build with full toolchain.
# Stage 2: minimal runtime image (Next.js "standalone" output) — ~150 MB final.

# --- builder ----------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /build

# Copy manifests first so the install layer caches across code changes.
# We use `npm install` (not `npm ci`) because the lockfile can drift between
# the host OS that authored it (Windows) and the Debian-slim node:20 image —
# transitive deps like @swc/helpers occasionally don't carry across. `install`
# reconciles in place; the build is still deterministic enough for a marketing
# site and we trade ~5s of extra build time for a more forgiving deploy.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Public API URL must be present at BUILD time — Next.js inlines NEXT_PUBLIC_*
# into the client bundle during `next build`. Passed from docker-compose build.args.
ARG NEXT_PUBLIC_API_URL=https://api.wapsell.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy source and build. `output: "standalone"` (set in next.config.js) emits
# a self-contained .next/standalone/ tree that runs without node_modules.
COPY . .
RUN npm run build

# --- runtime ----------------------------------------------------------------
FROM node:20-slim AS runtime

WORKDIR /app

# Non-root for runtime — Next.js doesn't need root and we want to limit
# blast radius if the container is ever compromised.
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone output includes a minimal server.js + just the dependencies
# Next actually used. Public assets and .next/static aren't part of it; copy
# them explicitly.
COPY --from=builder --chown=nextjs:nodejs /build/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /build/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /build/public ./public

USER nextjs

# Bind 0.0.0.0 inside the container; the compose file maps it to 127.0.0.1
# on the host so only nginx reaches it.
ENV HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
