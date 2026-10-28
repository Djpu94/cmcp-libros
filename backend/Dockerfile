# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

FROM base AS build
RUN npm ci
COPY backend backend
RUN npm exec --workspace backend -- prisma generate \
  && npm run build --workspace backend

FROM base AS runtime
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm ci --omit=dev --workspace backend \
  && npm cache clean --force
COPY backend/prisma backend/prisma
COPY --from=build /app/backend/dist backend/dist
RUN npm exec --workspace backend -- prisma generate \
  && mkdir -p backend/uploads/books \
  && chown -R node:node /app/backend/uploads

WORKDIR /app/backend
USER node
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
