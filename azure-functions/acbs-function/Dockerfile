FROM mcr.microsoft.com/azure-functions/node:4.9.1-node18-slim

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

WORKDIR /home/site/wwwroot

COPY package.json .

RUN npm install --legacy-peer-deps

COPY . /home/site/wwwroot
