###################
# 0. BASE
###################
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG ROOT=/app
ARG MICROSERVICE=portal-ui

###################
# 1. BUILD
###################

FROM node:24.1.0-alpine3.20 AS build

# Shell
SHELL ["/bin/sh", "-c"]

# Variables
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG ROOT
ARG MICROSERVICE
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_SHA=$GITHUB_SHA
ENV ROOT=$ROOT
ENV MICROSERVICE=$MICROSERVICE

WORKDIR ${ROOT}

# Root
COPY --chown=node:node ./package.json .
COPY --chown=node:node ./package-lock.json .
COPY --chown=node:node ./nodemon.json .
COPY --chown=node:node ./start.sh .

# Central library
COPY --chown=node:node ./libs/common/package.json ./libs/common/package.json
COPY --chown=node:node ./libs/common/tsconfig.json ./libs/common/tsconfig.json
COPY --chown=node:node ./libs/common/src ./libs/common/src

# Microservice codebase
COPY --chown=node:node ./${MICROSERVICE}/package.json ./${MICROSERVICE}/package.json
COPY --chown=node:node ./${MICROSERVICE}/tsconfig.json ./${MICROSERVICE}/tsconfig.json
COPY --chown=node:node ./${MICROSERVICE}/public ./${MICROSERVICE}/public
COPY --chown=node:node ./${MICROSERVICE}/scripts ./${MICROSERVICE}/scripts
COPY --chown=node:node ./${MICROSERVICE}/server ./${MICROSERVICE}/server
COPY --chown=node:node ./${MICROSERVICE}/styles ./${MICROSERVICE}/styles
COPY --chown=node:node ./${MICROSERVICE}/templates ./${MICROSERVICE}/templates

# Lean NPM - Only install `dependencies`
# `devDependencies` will still be resolved inside `package-lock.json`,
# however they will not be installed inside `node_modules` directory.
RUN npm ci --omit=dev --ignore-scripts --workspace=${MICROSERVICE}

###################
# 2. PRODUCTION
###################

FROM node:24.1.0-alpine3.20 AS production

# Shell
SHELL ["/bin/sh", "-c"]

# Variables
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG ROOT
ARG MICROSERVICE
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_SHA=$GITHUB_SHA
ENV ROOT=$ROOT
ENV MICROSERVICE=$MICROSERVICE

WORKDIR ${ROOT}

# Copy from `build` to `prod`
COPY --chown=node:node --from=build ${ROOT}/package.json .
COPY --chown=node:node --from=build ${ROOT}/package-lock.json .
COPY --chown=node:node --from=build ${ROOT}/node_modules ./node_modules
COPY --chown=node:node --from=build ${ROOT}/nodemon.json ./nodemon.json
COPY --chown=node:node --from=build ${ROOT}/start.sh ./start.sh

COPY --chown=node:node --from=build ${ROOT}/libs/common/package.json ./libs/common/package.json
COPY --chown=node:node --from=build ${ROOT}/libs/common/tsconfig.json ./libs/common/tsconfig.json
COPY --chown=node:node --from=build ${ROOT}/libs/common/node_modules ./libs/common/node_modules
COPY --chown=node:node --from=build ${ROOT}/libs/common/src ./libs/common/src

COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/package.json ./${MICROSERVICE}/package.json
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/tsconfig.json ./${MICROSERVICE}/tsconfig.json
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/node_modules ./${MICROSERVICE}/node_modules
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/public ./${MICROSERVICE}/public
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/scripts ./${MICROSERVICE}/scripts
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/server ./${MICROSERVICE}/server
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/styles ./${MICROSERVICE}/styles
COPY --chown=node:node --from=build ${ROOT}/${MICROSERVICE}/templates ./${MICROSERVICE}/templates

# File permission
RUN chmod +x ${ROOT}/start.sh

# Expose listening port
EXPOSE ${PORT}

# Container healthcheck
HEALTHCHECK \
--interval=60s \
--timeout=30s \
CMD curl \
-fail http://localhost:${PORT} \
|| exit 1

# Non-root user
USER node

# Execute Script
CMD ["npm", "run", "start:dev", "-c", "$MICROSERVICE"]
