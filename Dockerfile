FROM node:lts-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /workspace
WORKDIR /workspace

FROM base as prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM base as build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:lts-alpine as runtime
WORKDIR /app
COPY --from=build /workspace/dist /workspace/package.json ./
COPY --from=prod-deps /workspace/node_modules ./node_modules

ENV DEBUG=app

CMD [ "node", "index.js" ]
