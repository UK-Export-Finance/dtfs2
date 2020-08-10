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
 * Cosmos DB for MongoDB API

NB: when creating a container registry, the "admin user" currently needs to be enabled. Work has started to enable use of Service Identities: https://feedback.azure.com/forums/169385-web-apps/suggestions/36145444-web-app-for-containers-acr-access-requires-admin

NB: App Service for containers currently passes a `PORT` of 80 to the container. This means containers are running as root, rather than as a non-privileged user, which adds some risk.
