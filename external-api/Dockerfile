# Node Alpine Docker Image
FROM node:21.0.0-alpine3.17

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Node Setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript
RUN npm cache clean --force
COPY . .

# Execute Script
CMD ["nodemon", "src/index.ts"]
