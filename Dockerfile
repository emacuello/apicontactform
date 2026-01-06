# -----------------------------------------------------------------------------
# ETAPA 1: Dependencias de Desarrollo
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
# libc6-compat suele ser necesario para librerías nativas/C++
RUN apk add --no-cache libc6-compat
WORKDIR /app

# MEJORA: Copiamos package.json Y package-lock.json para asegurar versiones exactas
COPY package*.json ./

# MEJORA: Usamos 'npm ci' para una instalación limpia, rápida y determinista basada en el lockfile
RUN npm ci

# -----------------------------------------------------------------------------
# ETAPA 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos node_modules de la etapa anterior (ya cacheados)
COPY --from=deps /app/node_modules ./node_modules

# Copiamos el código fuente
COPY . .

# Generamos el build de producción
RUN npm run build

# -----------------------------------------------------------------------------
# ETAPA 3: Dependencias de Producción
# -----------------------------------------------------------------------------
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package*.json ./

# MEJORA: Instalamos solo dependencias de producción usando 'npm ci'
RUN npm ci --omit=dev --ignore-scripts

# -----------------------------------------------------------------------------
# ETAPA 4: Runner
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# MEJORA: Instalamos 'dumb-init' para manejar correctamente las señales del sistema (SIGTERM)
RUN apk add --no-cache dumb-init

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copiamos las dependencias limpias de producción
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiamos el build generado
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Si tu app necesita archivos estáticos o templates, descomenta la siguiente línea:
# COPY --from=builder --chown=nestjs:nodejs /app/public ./public 

USER nestjs

EXPOSE 3000

# MEJORA: Usamos dumb-init como entrypoint para envolver el proceso de Node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "dist/main"]