![Pipeline](https://github.com/notbinary/dtfs2/workflows/Pipeline/badge.svg)

# UKEF Trade Finance Service

This repository contains the code for the UK Export Finance Trade Finance Service.

## Getting started

### Prerequisites

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

### Setup

* Clone this repo
* Run `nvm install` to ensure you are using the correct version of node
* Create `.env` files for each service. You can use `.env.sample` as a base. Some sensitive variables need to be shared from the team
* Generate JWT keypairs with `secrets/set_jwt_keypair.sh` (`bash secrets/set_jwt_keypair.sh` for Windows)
* Base64 encode the generated public and private keys and add to your portal-api .env file:
  * `JWT_SIGNING_KEY=1234`
  * `JWT_VALIDATING_KEY=5678`
* Set session secret environment variable in your terminal. eg: `export SESSION_SECRET=abc1234`
* Set UKEF TFM environment variables in your terminal: `UKEF_TFM_API_SYSTEM_KEY` and `UKEF_TFM_API_REPORTS_KEY`
* Start up your local environment: `docker-compose up --build`
* Create mock data: navigate to `utils/mock-data-loader`, run `npm install` and then `node re-insert-mocks.js`. This should generate mocks in your DB.
* Run `npm run pipeline` in the root directory of the repo to run a full build and test to make sure that everything is working.

Recommended: Install a MongoDB client such as Compass or Robo 3T.

Note: If you're on Windows and having issues with MongoDB, install mongosh for command line debugging.

## Running the world locally

```shell
docker-compose up
```

*warning: If you make changes to a UI server, you'll need to do a build with `docker-compose up --build`. Hot reloading will be in place shortly

### Several services are built

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

To access GEF locally, use http://localhost.

## Stop running the world locally

Simply escape the running terminal and run:

```shell
docker-compose down
```

## Environment Variables

As we interface with a number of 3rd party APIs, there are a range of environment variables required to manage this and to work with the repo locally.

All variables are listed in a private spreadsheet - this needs to be shared with new engineers and updated appropriately.

These variables are stored as secrets in the repo. To update secrets in the environments - i.e dev, test etc:

* Create a Github Personal Access Token and save in `/secrets/github/pat.txt` - this only needs to be done once
* Download the spreadsheet as a CSV and place in this directory: `/secrets/github`
* Run this script `/secrets/github/set_secrets.js`

This will update all github secrets. When deploying to different environments, the github secret values are picked up.

## Testing

#### **Run all tests (E2E, API and UI)**

With docker running, execute all tests with:

```shell
npm run pipeline
```

### E2E tests

From the respective folder (./e2e-tests/portal, ./e2e-tests/gef, ./e2e-tests/submit-to-trade-finance-manager, ./e2e-tests/trade-finance-manager)

#### **Run an E2E test suite**

```shell
npx cypress run --config video=false
```

#### **Run a single E2E test**

```shell
npx cypress run --spec "cypress/integration/**/my-test.spec.js" --config video=false
```

#### **For live debugging, open the GUI and select the test:**

```shell
npx cypress open .
```

### API tests

From the respective folder (./portal-api, ./dtfs-central-api, ./trade-finance-manager-api):)

#### **Run an API test suite**

```shell
npm run api-test
```

#### **Run a single API test**

```shell 
npm run api-test-file "**/*/deals-party-db.api-test.js"
```

### UI tests

From the respective folder (./portal, ./gef-ui, ./trade-finance-manager-ui)

#### **Run a UI test suite**

```shell
npm run test
```

#### **Run a single UI test**
```shell
npm run test /path/to/file.test.js
```

## Git workflow

1) Create a branch and PR clearly describing the change, along with Jira ticket number
2) PR will run tests for the affected services
3) PR tests are pass, another engineer reviews & approves the PR
4) PR is merged into master branch

Github actions will then run a build and push of container images to Azure, which will be picked up and deployed automatically by the Dev environment.

## CI

Several environments are used:
* http://tfs-dev-fd.azurefd.net/
* http://tfs-demo-fd.azurefd.net/
* http://tfs-test-fd.azurefd.net/
* http://tfs-staging-fd.azurefd.net/
* http://tfs-prod-fd.azurefd.net/


GEF test environment is hosted on the same URL as Portal v2. To access GEF:

* Login to Portal v2: https://tfs-test-fd.azurefd.net
* Manually navigate to this GEF URL, to create a new GEF application: https://tfs-test-fd.azurefd.net/gef/mandatory-criteria
* Alternatively, visit an existing GEF deal by ID: http://tfs-test-fd.azurefd.net/gef/deals/1

## Deployment

The dev environment is the only environment that is automatically updated. All other environments require a manual trigger.
This ensures that the environments are stable, unaffected by CI/CD and the business can continue with QA and user testing.

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

## Updating the database

Should the database need to be refreshed with the latest mock data then this can be done by:

1. SSH into the relevant VM (Dev-VM for dev & demo, Test-VM for test & staging, Prod-VM for prod):
`ssh azureuser@xx.xx.xx.xx`, where xx.xx.xx.xx is the IP Address for VM.
The IP for these can be found in https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Compute%2FVirtualMachines
*Your public SSH key must first be added to the VM by someone with access.*
2. `cd dtfs2 && git pull` to get the latest codebase
3. `cd utils/mock-data-loader`
4. Enure the .env file is pointing to the environment you want to update
5. `node re-insert-mocks.js` *warning: **this will delete the current data - DO NOT USE IN PROD**

## Azure storage account

This is needed to work with file uploads and azure functions. You can create a storage account inside the Azure Portal GUI:

Home > Services > Storage accounts > Create

## Azure functions

To run Azure functions locally:

1. Run everything as normal (`docker-compose up` from the root directory)
2. In a seperate terminal tab, go to azure-functions directory and run `docker-compose up`

Ideally, azure-functions would be run in the same root docker, but this caused memory issues in github actions.
