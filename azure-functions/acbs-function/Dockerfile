FROM mcr.microsoft.com/azure-functions/node:4.34.0-node14

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

WORKDIR /home/site/wwwroot

COPY package.json .

RUN npm install

COPY . /home/site/wwwroot
