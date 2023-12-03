FROM node:16

COPY package.json yarn.lock /build/

WORKDIR /build

RUN yarn

COPY . /build/

RUN yarn build

FROM node:16

WORKDIR /app/

ENV NODE_PORT=4000

EXPOSE 4000

COPY package.json yarn.lock /app/

RUN yarn --production && yarn autoclean --force && yarn cache clean

COPY --from=0 /build/dist/ /app/

RUN mkdir /app/data

VOLUME /app/data

ENV APP_DATA_PATH=/app/data/app.db

ENV LOG_LEVEL=info

CMD node --enable-source-maps server.cjs

COPY lib-toost/ /app/lib-toost

COPY src-server/views/ /app/src-server/views
