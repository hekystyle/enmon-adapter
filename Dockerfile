FROM node:lts-alpine as build
WORKDIR /workspace

COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile

COPY src src
COPY tsconfig.json tsconfig.build.json ./
RUN yarn build

FROM node:lts-alpine as runtime
WORKDIR /app
COPY --from=build /workspace/dist /workspace/package.json ./
COPY --from=build /workspace/node_modules ./node_modules

ENV DEBUG=app

CMD [ "node", "index.js" ]
