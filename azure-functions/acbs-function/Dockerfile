# Node Azure Functions v4 Image
FROM mcr.microsoft.com/azure-functions/node:4-node22

# Variables
ENV AzureWebJobsScriptRoot=/app
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true
ENV FUNCTIONS_WORKER_RUNTIME=node
ENV AzureWebJobsFeatureFlags=EnableWorkerIndexing

# Directories setup
WORKDIR /app
COPY azure-functions/acbs-function .
COPY ../../package-lock.json .

COPY libs libs

RUN npm i
RUN npm cache clean --force
