FROM node:lts-alpine

WORKDIR /app

ADD package.json .
ADD package-lock.json .
RUN npm install

ADD . .
RUN npm run buildProd

ENTRYPOINT node dist/server.js

