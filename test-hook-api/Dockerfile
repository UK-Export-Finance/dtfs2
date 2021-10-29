FROM node:lts-alpine AS image

WORKDIR /app

ADD package.json .
RUN npm install --legacy-peer-deps

ADD ./src ./src

#USER 1000
CMD node src/index.js
