FROM mcr.microsoft.com/azure-functions/node:4.9.1-node18-slim

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    FUNCTIONS_WORKER_RUNTIME=node

WORKDIR /home/site/wwwroot

COPY package.json .

RUN npm install --legacy-peer-deps

COPY . /home/site/wwwroot
