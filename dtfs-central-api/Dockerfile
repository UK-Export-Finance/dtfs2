###################
# 0. BASE
###################
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG MICROSERVICE=dtfs-central-api

###################
# 1. BUILD
###################

FROM node:24.1.0-alpine3.20 AS build

# Variables
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG MICROSERVICE
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_SHA=$GITHUB_SHA
ENV MICROSERVICE=$MICROSERVICE

WORKDIR /app

# Root
COPY --chown=node:node ./package.json .
COPY --chown=node:node ./package-lock.json .

# Central library
COPY --chown=node:node ./libs/common/package.json ./libs/common/package.json
COPY --chown=node:node ./libs/common/tsconfig.json ./libs/common/tsconfig.json
COPY --chown=node:node ./libs/common/src ./libs/common/src

# Microservice codebase
COPY --chown=node:node ./${MICROSERVICE}/package.json ./${MICROSERVICE}/package.json
COPY --chown=node:node ./${MICROSERVICE}/tsconfig.json ./${MICROSERVICE}/tsconfig.json
COPY --chown=node:node ./${MICROSERVICE}/server ./${MICROSERVICE}/server

# Lean NPM - Only install `dependencies`
# `devDependencies` will still be resolved inside `package-lock.json`,
# however they will not be installed inside `node_modules` directory.
RUN npm ci --omit=dev --ignore-scripts

###################
# 2. PRODUCTION
###################

FROM node:24.1.0-alpine3.20 AS production

# Variables
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG MICROSERVICE
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_SHA=$GITHUB_SHA
ENV MICROSERVICE=$MICROSERVICE

WORKDIR /app

# Copy from `build` to `prod`
COPY --chown=node:node --from=build /app/package.json .
COPY --chown=node:node --from=build /app/package-lock.json .
COPY --chown=node:node --from=build /app/node_modules ./node_modules

COPY --chown=node:node --from=build /app/libs/common/package.json ./libs/common/package.json
COPY --chown=node:node --from=build /app/libs/common/tsconfig.json ./libs/common/tsconfig.json
COPY --chown=node:node --from=build /app/libs/common/node_modules ./libs/common/node_modules
COPY --chown=node:node --from=build /app/libs/common/src ./libs/common/src

COPY --chown=node:node --from=build /app/${MICROSERVICE}/package.json ./${MICROSERVICE}/package.json
COPY --chown=node:node --from=build /app/${MICROSERVICE}/tsconfig.json ./${MICROSERVICE}/tsconfig.json
COPY --chown=node:node --from=build /app/${MICROSERVICE}/node_modules ./${MICROSERVICE}/node_modules
COPY --chown=node:node --from=build /app/${MICROSERVICE}/server ./${MICROSERVICE}/server

# Expose listening port
EXPOSE ${PORT}

# Container healthcheck
HEALTHCHECK \
--interval=60s \
--timeout=30s \
CMD wget \
--no-verbose \
--tries=3 \
--spider https://localhost:${PORT} \
|| exit 1

# Execute Script
CMD ["npm", "run", "start", "-w", ${MICROSERVICE}]

# Non-root user
USER node
