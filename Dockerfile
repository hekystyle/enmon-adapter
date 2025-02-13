FROM node:22.14.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /workspace

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /workspace
COPY src src
COPY tsconfig.build.json tsconfig.json ./
RUN pnpm run build

FROM deps AS pruned
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter enmon-adapter --prod deploy pruned

FROM node:22.14.0-alpine AS runtime
LABEL org.opencontainers.image.source=https://github.com/hekystyle/enmon-adapter
WORKDIR /app

ENV NODE_ENV=production APP_HTTP_PORT=80

COPY --from=build /workspace/dist .
COPY --from=pruned /workspace/pruned .
COPY config/default.yml config/default.yml

HEALTHCHECK CMD sh -c "wget -q --spider --timeout=5 --tries=1 http://127.0.0.1:$APP_HTTP_PORT/health || exit 1"
CMD ["node", "main.js"]
