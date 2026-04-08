FROM node:25-bookworm-slim AS deps

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

FROM node:25-bookworm-slim AS builder

WORKDIR /app/frontend

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend ./

RUN npm run build -- --webpack

FROM node:25-bookworm-slim AS runner

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/frontend ./

EXPOSE 3000

CMD ["npm", "run", "start"]
