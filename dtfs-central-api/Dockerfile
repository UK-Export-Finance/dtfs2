# Node Alpine Docker Image
FROM node:23.1.0-alpine3.20

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Directories setup
WORKDIR /app

COPY libs libs
COPY dtfs-central-api dtfs-central-api

COPY package*.json .
RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "dtfs-central-api/src/index.ts"]
