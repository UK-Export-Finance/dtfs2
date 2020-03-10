
# Build container

FROM node:lts-alpine as build

WORKDIR /build

RUN npm install -g webpack webpack-cli

ADD . .
RUN npm install
RUN npm run buildProd


# Runtime container

FROM node:lts-alpine

WORKDIR /app

COPY --from=build /build/node_modules node_modules/
COPY --from=build /build/dist dist/
COPY --from=build /build/scripts scripts/
COPY --from=build /build/styles styles/
COPY --from=build /build/templates templates/

CMD node dist/server.js
