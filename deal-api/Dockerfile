FROM node:lts-alpine

WORKDIR /app

ADD package.json .
RUN npm install

ADD . .

ENTRYPOINT node index.js
