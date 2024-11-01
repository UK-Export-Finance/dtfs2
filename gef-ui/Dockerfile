# Node Alpine Docker Image
FROM node:23.1.0-alpine3.20

# Variable
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Directories setup
WORKDIR /app

COPY libs libs
COPY gef-ui gef-ui

COPY package*.json .
RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "gef-ui/server/index.ts"]
