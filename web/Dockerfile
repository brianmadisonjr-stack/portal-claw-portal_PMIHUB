# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci


FROM node:22-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time Prisma client generation
RUN npx prisma generate

RUN npm run build


FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# App runtime files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/prisma ./prisma

# If you have other runtime assets (e.g. scripts), add them here.

EXPOSE 4000

# NOTE: migrations are run via docker compose command override on container start.
CMD ["npm","run","start","--","--hostname","0.0.0.0","--port","4000"]
