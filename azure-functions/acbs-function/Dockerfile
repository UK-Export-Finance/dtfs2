# Node Azure Functions v4 Image
FROM mcr.microsoft.com/azure-functions/node:4-node22

# Variables
ENV AzureWebJobsScriptRoot=/app
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true
ENV FUNCTIONS_WORKER_RUNTIME=node
ENV AzureWebJobsFeatureFlags=EnableWorkerIndexing

# Directories setup
WORKDIR /app

COPY libs libs
COPY azure-functions/acbs-function .

COPY package*.json .
RUN npm ci
RUN npm cache clean --force
