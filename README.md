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

### Secrets

Along with `secrets/set_jwt_keypair.sh` you'll need the following scripts to set environment variables when running the build:

 * `set_azure_api_keys.sh`
 * `set_companies_house_api_key.sh`
 * `set_gov_notify_api_key.sh`
 * `set_mulesoft_api_key.sh`
 * `set_session_secrets.sh`

The list of variables can be seen in the environment build workdlows under [`.github/workflows`](.github/workflows)

### Steps

 * Clone this repo
 * Add the environment variable scripts noted above to the `secrets` folder
 * Run `nvm install` to ensure you are using the correct version of node
 * Run `npm run pipeline` in the root directory of the repo to run a full build and test
 * After running the pipeline, you can use `docker-compose up` to start up your local environment
 * To refresh the data in the database, navigate to `utils/mock-data-loader`, run `npm install`and then `node re-insert-mocks.js`

NB this code has been developed on Mac OS and runs in Linux containers. You may need to adjust some steps if you need to run it on Windows.

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

### Git workflow

Github actions will run a build and push of container images to Azure, which will be picked up and deployed automatically by the Dev environment. If testing is successful, images will be promoted to the test environment.

Pushing to the `infrastructure` branch will trigger a refresh of the infrastructure in each environment. This updates the App Services and sets environment variables and secrets.

Pushing to the `demo` branch will trigger tagging of the current development container images with `demo` tag, which will in turn trigger a redeployment of the demo environment. This ensures the demo environment isn't affected by CI/CD and is only refreshed on demand.


