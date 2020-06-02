# Infrastructure summary 

## Subscriptions

There are two subscriptions, to manage costs:

 * Dev/Test
 * Prod

## Environments

There are three environments, represented by resource groups:

 * Dev
 * Test
 * Prod

## Components

The current Azure infrastructure for development consists of:

 * Azure Container Registry
 * Azure App Service for Containers: Portal
 * Azure App Service for containers: Deal API
 * (planned) Cosmos DB for MongoDB API

NB: when creating a container registry, the "admin user" currently needs to be enabled. Work has started to enable use of Service Identities: https://feedback.azure.com/forums/169385-web-apps/suggestions/36145444-web-app-for-containers-acr-access-requires-admin

## "Azure DevOps" Pipeline

The `azure-pipelines.yml` file is included at the root of this repo.

Additional secret values need to be configured via Pipelines as follows:

From the Connection String tab of Cosmos DB:

 * MONGODB_URI - the primary or secondary connection string
 * MONGO_INITDB_DATABASE - a database name, e.g. `deal-api-data`
 * MONGO_INITDB_ROOT_USERNAME - the username
 * MONGO_INITDB_ROOT_PASSWORD - the primary or secondary password
