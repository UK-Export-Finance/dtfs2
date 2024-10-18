# Node Alpine Docker Image
FROM node:23.0.0-alpine3.20

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Directories setup
WORKDIR /app

COPY libs libs
COPY trade-finance-manager-api trade-finance-manager-api

COPY package*.json .
RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "trade-finance-manager-api/src/index.ts"]
