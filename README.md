![Pipeline](https://github.com/notbinary/dtfs2/workflows/Pipeline/badge.svg)

# UKEF Trade Finance Service

This repository contains the code for the UK Export Finance Trade Finance Service.
 
## Setup

Prerequisites

 * Version 13 or later of `node` with a corresponding `npm`
 * Docker and Docker Compose

### Tech stack

 * Node, NPM
 * MongoDB
 * Docker
 * GraphQL
 * Cypress (e2e tests)
 * Webpack
 * GovUK and MOJ design systems
 * Nunjucks (UI templates)

### Getting started

* Clone this repo
* Run `nvm install` to ensure you are using the correct version of node
* Create `.env` files for each service. You can use `.env.sample` as a base. Some sensitive variables need to be shared from the team
* Generate JWT keypairs with `secrets/set_jwt_keypair.sh`
* Base64 encode the generated public and private keys and declare as environment variables in your terminal. E.g:
  * `export JWT_SIGNING_KEY=1234`
  * `export JWT_VALIDATING_KEY=1234`
* Ensure you have MongoDB installed on your machine. Create a DB called `dtfs-submissions` with default MongoDB port 27017
* Start up your local environment: `docker-compose up --build`
* Create mock data: navigate to `utils/mock-data-loader`, run `npm install`and then `node re-insert-mocks.js`. This should generate mocks in your DB.
* Optional/recommended: Run `npm run pipeline` in the root directory of the repo to run a full build and test to make sure that everything is working.

Note: If you're on Windows and having issues with MongoDB, install mongosh for command line debugging.

After these initial steps, you'll typically only need to run `docker-compose up` (without a full build). However, hot reloading is currently not in place for the UIs. If UI changes are made, you'll need to rebuild.

### Environment Variables

As we interface with a number of 3rd party APIs, there are a range of environment variables required to manage this and to work with the repo locally.

All variables are listed in a private spreadsheet - this needs to be shared with new engineers and updated appropriately.

These variables are stored as secrets in the repo. To update secrets in the environments - i.e dev, test etc:

* Download the spreadsheet as a CSV and place in this directory: `/secrets/github`
* Run this script `/secrets/github/set_secrets.js`

This will update all github secrets. When deploying to different environments, the github secret values are picked up.

### Testing

With docker running, execute all tests with:
```
Ensure npm install is run from within respective folder

Pipeline tests
From root:
npm run pipeline

Api Tests
From respective folder (./portal-api, ./dtfs-central-api)
All tests: npm run api-test
Individual tests: npm run api-test-file "**/*/deals-party-db.api-test.js"

E2E tests
From respective folder (./e2e-tests/portal, ./e2e-tests/trade-finance-manager, ./e2e-tests/gef)
All tests: npx cypress run
Individual tests: npx cypress open

```

### Running the world locally

Launch everything with:
```
docker-compose up --build
```

NB `--build` is optional - it will rebuild the contaners.

From another terminal, stop everything cleanly with:
```
docker-compose down
```

Several services are built:

| Service | URL |
| ------- | --- |
| Portal UI | http://localhost:5000 |
| Portal API | http://localhost:5001 |
| Reference Data Proxy | http://localhost:5002 |
| TFM UI | http://localhost:5003 |
| TFM API | http://localhost:5004 |
| Central API | http://localhost:5005 |
| GEF | http://localhost:5006 |
| Mongo DB | root:r00t@localhost:27017 | Connect via MongoDB client

### CI
Several environments are used:
- http://tfs-dev-fd.azurefd.net/
- http://tfs-demo-fd.azurefd.net/
- http://tfs-test-fd.azurefd.net/
- http://tfs-staging-fd.azurefd.net/
- http://tfs-prod-fd.azurefd.net/

### GEF test environment
GEF is hosted on the same URL as Portal v2. To access GEF:
- Login to Portal v2: https://tfs-test-fd.azurefd.net
- Manually navigate to this GEF URL, to create a new GEF application: https://tfs-test-fd.azurefd.net/gef/mandatory-criteria
- Alternatively, visit an existing GEF deal by ID: http://tfs-test-fd.azurefd.net/gef/deals/1

### Deploying to test
After merging to master, dev environment will be updated.

To deploy to the test environment, run the `update-test.sh` script in `.github/workflows` directory.
This will take the latest code in the development environment and deploy to test.

The latest deployed commit can be checked by looking at the test/dev branch, or visiting the healthcheck endpoint. E.g: https://tfs-test-fd.azurefd.net/healthcheck

### Deploying to demo
To deploy to the demo environment, run the `update-demo.sh` script in `.github/workflows` directory.
This will take the latest code in the development environment and deploy to demo.

The latest deployed commit can be checked by looking at the test/dev branch, or visiting the healthcheck endpoint. E.g: https://tfs-demo-fd.azurefd.net/healthcheck

### Deploying to staging
To deploy to the staging environment, run the `update-staging.sh` script in `.github/workflows` directory.
This will take the latest code in the test environment and deploy to staging.

The latest deployed commit can be checked by looking at the test/dev branch, or visiting the healthcheck endpoint. E.g: https://tfs-staging-fd.azurefd.net/healthcheck

### Deploying to prod
To deploy to the demo environment, run the `update-prod.sh` script in `.github/workflows` directory.
This will take the latest code in the staging environment and deploy to prod.

The latest deployed commit can be checked by looking at the test/dev branch, or visiting the healthcheck endpoint. E.g: https://tfs-prod-fd.azurefd.net/healthcheck

### Updating the database
Should the database need to be refreshed with the latest mock data then this can be done by:
1. SSH into the relevant VM (Dev-VM for dev & demo, Test-VM for test & staging, Prod-VM for prod):
`ssh azureuser@xx.xx.xx.xx`, where xx.xx.xx.xx is the IP Address for VM.
The IP for these can be found in https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Compute%2FVirtualMachines
*Your public SSH key must first be added to the VM by someone with access.*
2. `cd dtfs2 && git pull` to get the latest codebase
3. `cd utils/mock-data-loader`
4. Enure the .env file is pointing to the environment you want to update
5. `node re-insert-mocks.js` *warning: this will delete the current data - DO NOT USE IN PROD*

### Git workflow

Github actions will run a build and push of container images to Azure, which will be picked up and deployed automatically by the Dev environment. If testing is successful, images will be promoted to the test environment.

Pushing to the `infrastructure` branch will trigger a refresh of the infrastructure in each environment. This updates the App Services and sets environment variables and secrets.

Pushing to the `demo` branch will trigger tagging of the current development container images with `demo` tag, which will in turn trigger a redeployment of the demo environment. This ensures the demo environment isn't affected by CI/CD and is only refreshed on demand.


