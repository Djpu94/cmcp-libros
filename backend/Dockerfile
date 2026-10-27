FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY backend/prisma ./backend/prisma
RUN npm ci --workspace=backend --include-workspace-root=false

COPY backend ./backend
RUN npm run build --workspace=backend

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY backend/prisma ./backend/prisma
RUN npm ci --omit=dev --workspace=backend --include-workspace-root=false

COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 3000
CMD ["npm", "run", "start:prod", "--workspace=backend"]
