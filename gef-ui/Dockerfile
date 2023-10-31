# Node Alpine Docker Image
FROM node:21.0.0-alpine3.17

# Variable
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Node setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --legacy-peer-deps
RUN npm cache clean --force
COPY . .

# Execute Script
CMD ["node", "server/index.js"]
