# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/node:3.0-appservice
FROM mcr.microsoft.com/azure-functions/node:3.0-node14-appservice

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true\
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false\
    FUNCTIONS_WORKER_RUNTIME=node
    
COPY . /home/site/wwwroot

WORKDIR /home/site/wwwroot
RUN npm install