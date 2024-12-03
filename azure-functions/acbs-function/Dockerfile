# Node Azure Functions v4 Image
FROM mcr.microsoft.com/azure-functions/node:4-node22

# Variables
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true
ENV FUNCTIONS_WORKER_RUNTIME=node
ENV AzureWebJobsFeatureFlags=EnableWorkerIndexing

# Directories setup
WORKDIR /home/site/wwwroot

COPY azure-functions/acbs-function .

RUN npm i
RUN npm cache clean --force
