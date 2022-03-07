## Pipeline overview

At a high-level, the pipeline works by building container images and promoting them between registries:

 * Code is pushed to the `main` branch.
 * Container images are built.
 * API tests and E2E tests are then executed, E2E tests are executed on multiple machines.
 * If the tests passes, then the images are deployed to respective environments.
 * merging to the `test`, or `demo` branches promotes the current `dev` images to these environments
 * merging to the `prod` branch promotest the current `test` image to the production environment
 * merging to the `infrastructure` branch triggers a refresh of supporting infrastructure (e.g. container registries)

### Deployment

Deployment is triggered by webhooks from the container registries to the App Service instances. When an image is pushed, an App Service restart is required. This is handled by the Github Actions workflows.

### Environments

Workflows for each environment are triggered when the corresponding branch is updated. For the Dev environment this happens on update of main, after tests have passed.

Environment workflows ensure we've got the right infrastructure set up and correctly configured, plus any environment variables and secrets set as needed.

### Secrets

To add a new secret, set it in Github Secrets (under repository settings), then add it to each of the environment workflows.

To manage secrets across multiple environments, an automation script has been created under `/secrets/github`.

### Naming conventions

In general, naming conventions are: tfs-`environment`-`component` (in order of magnitude, so "service, environment, component"). That means a list of things will sort alphabetically into blocks of items that work together (e.g. all items that are part of a given environment).

A couple of places this works are:
 * Github secrets: you can scroll through the list and find out what secrets are set for a given environment
 * Azure App Services: you can see the environments as blocks in the list and find the services deployed a given environment

Other approaches are available, but this seems a reasonable one for now.

# Using AZ command-line locally

To run Azure CLI commands locally you'll need to install the az cli.

Additionally you'll need:
 * The Front Door extension: `az extension add --name front-door`
 

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

Currently testing an ACR task as follows:

PURGE_CMD="acr purge --filter 'portal:untagged' --filter 'portal-api:untagged' --ago 1d"
az acr task create --name purgeUntagged --cmd "$PURGE_CMD" --schedule "0 0 * * *" --registry dtfsdev --context /dev/null

 - based on: https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auto-purge