# Node Alpine Docker Image
FROM node:20.8.0-alpine3.17

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Node setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .

COPY libs libs
COPY dtfs-central-api dtfs-central-api

RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "dtfs-central-api/src/index.ts"]
