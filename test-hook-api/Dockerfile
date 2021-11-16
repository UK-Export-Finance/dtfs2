FROM node:14.18.1-alpine3.13 AS image

WORKDIR /app

ADD package.json .
RUN npm install

ADD ./src ./src

#USER 1000
CMD node src/index.js
