# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Для Prisma
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci

COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Сборка NestJS
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./

# Только production зависимости
RUN npm ci --omit=dev

# Prisma schema (нужна для migrate deploy)
COPY --from=builder /app/prisma ./prisma

# Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Собранный NestJS
COPY --from=builder /app/dist ./dist

# Если есть публичные файлы
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/uploads ./uploads

EXPOSE 5000

CMD ["node", "dist/src/main.js"]