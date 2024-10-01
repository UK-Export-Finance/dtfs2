# Node Alpine Docker Image
FROM node:22.9.0-alpine3.20

# Variable
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Node setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .

COPY libs libs
COPY gef-ui gef-ui

RUN npm ci
RUN npm cache clean --force

# Execute Script
CMD ["npx", "ts-node", "gef-ui/server/index.ts"]
