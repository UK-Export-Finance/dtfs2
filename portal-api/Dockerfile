# Node Alpine Docker Image
FROM node:22.8.0-alpine3.20

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Directories setup
WORKDIR /app
COPY package.json .
COPY ../package-lock.json .

COPY libs libs
COPY portal-api portal-api

RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "portal-api/src/index.ts"]
