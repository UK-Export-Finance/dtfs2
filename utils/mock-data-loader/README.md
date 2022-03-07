# mock-data-loader

:warning: DO NOT use in production

Uses API calls to clean the database with fresh, mock data.

* Wipe MongoDB collections
* Insert mock data (users, banks, deals, facilities, etc)

## Why

This avoids manually managing data. This is especially useful and mostly used for local development.

This script can also be run in different environments such as test environment and staging.

The mock deals and facilities are also used for User Research Testing, in the staging environment.

:warning: Check with the wider team before wiping/reinserting mocks in the test or staging environment. We should not interrupt QA or User Research Testing.

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

1. Start all services from the root directory

    ```shell
    docker-compose up
    ```

2. Run the script

    ```shell
    node ./re-insert-mocks.js
    ```

## Updating the database in other environments

Should the database need to be refreshed with the latest mock data then this can be done by:

1. SSH into the relevant VM (Dev-VM for dev & demo, Test-VM for test & staging, Prod-VM for prod):
`ssh azureuser@xx.xx.xx.xx`, where xx.xx.xx.xx is the IP Address for VM.
The IP for these can be found in https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Compute%2FVirtualMachines
*Your public SSH key must first be added to the VM by someone with access.*
2. `cd dtfs2 && git pull` to get the latest codebase
3. `cd utils/mock-data-loader`
4. Enure the .env file is pointing to the environment you want to update
5. `node re-insert-mocks.js` :warning: **this will delete the current data - DO NOT USE IN PROD**

## Notifying other teams of breaking changes

:warning: When cleaning the dev database, we need to notify other teams of this (another team consumes the TFM GraphQL API) by emailing "IT Mulesoft Technical Support".