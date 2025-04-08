FROM node:18.20.3-alpine3.18 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml .env ./

COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate

COPY . .
RUN pnpm run build

FROM node:18.20.3-alpine3.18

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache \
    graphicsmagick \
    ghostscript

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile --prod && \
    pnpm prisma generate && \
    pnpm remove @shopify/cli && \
    pnpm store prune

COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["pnpm", "run", "start"]

