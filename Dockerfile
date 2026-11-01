# -----------------------------------------------------------------------------
# ETAPA 1: Base con pnpm (versión fijada por "packageManager" en package.json)
# -----------------------------------------------------------------------------
FROM node:24-alpine AS base
# libc6-compat suele ser necesario para librerías nativas/C++
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# -----------------------------------------------------------------------------
# ETAPA 2: Builder (todas las dependencias + build)
# -----------------------------------------------------------------------------
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# -----------------------------------------------------------------------------
# ETAPA 3: Dependencias de Producción
# -----------------------------------------------------------------------------
FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# -----------------------------------------------------------------------------
# ETAPA 4: Runner
# -----------------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# dumb-init para manejar correctamente las señales del sistema (SIGTERM)
RUN apk add --no-cache dumb-init

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "dist/main"]
