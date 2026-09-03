# syntax=docker/dockerfile:1
FROM node:24-alpine AS deps
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data \
    PUBLIC_DIR=/app/public
WORKDIR /app

RUN apk add --no-cache tini wget \
 && addgroup -g 10001 -S app \
 && adduser  -u 10001 -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY server/package.json ./package.json
COPY server/server.js ./server.js
COPY server/admin.html ./admin.html
COPY server/lib ./lib
COPY server/public ./public

RUN mkdir -p /app/data && chown -R app:app /app
USER app
VOLUME ["/app/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","server.js"]
