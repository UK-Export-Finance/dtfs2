###################
# 0. BASE
###################
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG ROOT=/home/site/wwwroot
ARG MICROSERVICE=azure-functions/acbs
ARG AzureFunctionsJobHost__Logging__Console__IsEnabled=true
ARG FUNCTIONS_WORKER_RUNTIME=node
ARG AzureWebJobsFeatureFlags=EnableWorkerIndexing

FROM mcr.microsoft.com/azure-functions/node:4-node22 AS build

# Variables
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG ROOT
ARG MICROSERVICE
ARG AzureFunctionsJobHost__Logging__Console__IsEnabled
ARG FUNCTIONS_WORKER_RUNTIME
ARG AzureWebJobsFeatureFlags
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_SHA=$GITHUB_SHA
ENV ROOT=$ROOT
ENV MICROSERVICE=$MICROSERVICE
ENV AzureWebJobsScriptRoot=${ROOT}
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=$AzureFunctionsJobHost__Logging__Console__IsEnabled
ENV FUNCTIONS_WORKER_RUNTIME=$FUNCTIONS_WORKER_RUNTIME
ENV AzureWebJobsFeatureFlags=$AzureWebJobsFeatureFlags

WORKDIR ${AzureWebJobsScriptRoot}

# Root
COPY --chown=node:node ./package.json .
COPY --chown=node:node ./package-lock.json .

COPY --chown=node:node ./${MICROSERVICE}/package.json ./${MICROSERVICE}/package.json
COPY --chown=node:node ./${MICROSERVICE}/tsconfig.json ./${MICROSERVICE}/tsconfig.json
COPY --chown=node:node ./${MICROSERVICE}/api.js ./${MICROSERVICE}/api.js
COPY --chown=node:node ./${MICROSERVICE}/apim-mdm.js ./${MICROSERVICE}/apim-mdm.js
COPY --chown=node:node ./${MICROSERVICE}/host.json ./${MICROSERVICE}/host.json
COPY --chown=node:node ./${MICROSERVICE}/.funcignore ./${MICROSERVICE}/.funcignore
COPY --chown=node:node ./${MICROSERVICE}/constants ./${MICROSERVICE}/constants
COPY --chown=node:node ./${MICROSERVICE}/helpers ./${MICROSERVICE}/helpers
COPY --chown=node:node ./${MICROSERVICE}/mappings ./${MICROSERVICE}/mappings
COPY --chown=node:node ./${MICROSERVICE}/src ./${MICROSERVICE}/src

# Lean NPM - Only install `dependencies`
# `devDependencies` will still be resolved inside `package-lock.json`,
# however they will not be installed inside `node_modules` directory.
RUN npm ci --omit=dev --ignore-scripts --workspace=${MICROSERVICE}

###################
# 2. PRODUCTION
###################

FROM mcr.microsoft.com/azure-functions/node:4-node22 AS production

# Variables
ARG PORT
ARG NODE_ENV
ARG GITHUB_SHA
ARG ROOT
ARG MICROSERVICE
ARG AzureFunctionsJobHost__Logging__Console__IsEnabled
ARG FUNCTIONS_WORKER_RUNTIME
ARG AzureWebJobsFeatureFlags
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_SHA=$GITHUB_SHA
ENV ROOT=$ROOT
ENV MICROSERVICE=$MICROSERVICE
ENV AzureWebJobsScriptRoot=${ROOT}/${MICROSERVICE}
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=$AzureFunctionsJobHost__Logging__Console__IsEnabled
ENV FUNCTIONS_WORKER_RUNTIME=$FUNCTIONS_WORKER_RUNTIME
ENV AzureWebJobsFeatureFlags=$AzureWebJobsFeatureFlags

WORKDIR ${AzureWebJobsScriptRoot}

# Copy from `build` to `prod`
COPY --chown=node:node --from=build ${ROOT}/package.json .
COPY --chown=node:node --from=build ${ROOT}/package-lock.json .
COPY --chown=node:node --from=build ${ROOT}/node_modules ./node_modules

COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/package.json ./package.json
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/node_modules ./node_modules
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/api.js ./api.js
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/apim-mdm.js ./apim-mdm.js
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/host.json ./host.json
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/.funcignore ./.funcignore
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/constants ./constants
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/helpers ./helpers
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/mappings ./mappings
COPY --chown=node:node --from=build ${AzureWebJobsScriptRoot}/src ./src

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
