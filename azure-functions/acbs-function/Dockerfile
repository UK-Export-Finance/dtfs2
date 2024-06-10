# Node Azure Functions v4 Image
FROM mcr.microsoft.com/azure-functions/node:4-node18

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true
ENV FUNCTIONS_WORKER_RUNTIME=node
ENV AzureWebJobsFeatureFlags=EnableWorkerIndexing

# Node Setup
WORKDIR /home/site/wwwroot
COPY package.json .

RUN npm i

COPY . /home/site/wwwroot
