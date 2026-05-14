# Single-stage build on node:22-alpine. We build everything (admin-web +
# backend + prisma generate) inside the container, then run the already
# compiled JS (no tsx/ts-node at runtime).
#
# Multi-stage is deliberately avoided: both frontends (vite) and the
# backend (nest tsc) write into the same /usr/src/app/dist-{admin-web,
# backend}. Splitting into two stages with the same base image and the
# same dependency set saves very little space and makes layer
# invalidation notably harder to reason about.
FROM node:22-alpine

WORKDIR /usr/src/app

# openssl is needed by the Prisma query engine at runtime (the engine is
# a native binary linked against libssl). node:22-alpine builds fine
# without it, but the first DB call would fail. wget is already in
# busybox alpine — used by the compose healthcheck.
RUN apk add --no-cache openssl ca-certificates

COPY package.json package-lock.json ./
RUN npm ci

# Full sources: vite/nest read tsconfigs from apps/* and shared/*. The
# layers above (npm ci) are reused as long as nothing but sources change.
COPY . .

# Prisma 7's prisma.config.ts uses `env("DATABASE_URL")` and eager-
# resolves the variable even for `prisma generate` (same gotcha as in
# reminder). We pass a dummy value scoped to this RUN — the variable is
# not baked into the final image.
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate

# Build both frontends (admin-web via vite) and the backend (nest build
# = tsc). Artifacts: dist-admin-web/, dist-backend/.
RUN npm run build

# Drop devDeps — saves ~250 MB in the final image. Dev-only packages
# (jest, vite, nest CLI) are no longer needed: backend runs as compiled
# JS, the frontend is static.
RUN npm prune --omit=dev

CMD ["node", "dist-backend/apps/backend/src/main.js"]
