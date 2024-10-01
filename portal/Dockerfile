# Node Alpine Docker Image
FROM node:22.9.0-alpine3.20

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Node Setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .

COPY libs libs
COPY portal portal

RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "portal/server/index.ts"]
