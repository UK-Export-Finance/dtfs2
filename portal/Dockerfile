FROM node:lts-alpine

WORKDIR /app

ADD . .
RUN npm install

# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

CMD npx babel-node server/index.js
