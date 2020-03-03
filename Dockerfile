FROM node:lts-alpine

WORKDIR /app

ADD package.json .
ADD package-lock.json .
ADD webpack.* ./
RUN npm install

ADD . .

ENTRYPOINT node index.js
