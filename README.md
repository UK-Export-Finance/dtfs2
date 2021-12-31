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

To access GEF locally, use http://localhost.

## Stop running the world locally

Simply escape the running terminal and run:

```shell
docker-compose down
```

## Login credentials

* For Portal (BSS & GEF) mock users: utils/mock-data-loader/portal/users.js
* For Trade Finance Manager (TFM) mock users: utils/mock-data-loader/tfm/users.js

## Environment Variables

As we interface with a number of 3rd party APIs, there are a range of environment variables required to manage this and to work with the repo locally.

All variables are listed in a private spreadsheet - this needs to be shared with new engineers and updated appropriately.

These variables are then stored as secrets in the GitHub repo. When deploying to an Azure environment, Azure picks up the GitHub secrets and updates accordingly.

To update a secret (Make sure to select the relevant environments, i.e dev, test):

1) Update the secret in the spreadsheet
2) Update the secret in GitHub secrets
3) Deploy to development environment
4) Deploy to test environment

## Testing

### **Run all tests (E2E, API and UI)**

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

## Linting

In the root directory - or in any service, run:

```shell
npm run lint
```

## Git workflow

1) Create a branch and PR clearly describing the change, along with Jira ticket number
2) PR will run tests for the affected services
3) PR tests are pass, another engineer reviews & approves the PR
4) PR is merged into main branch

Github actions will then run a build and push of container images to Azure, which will be picked up and deployed automatically by the Dev environment.

E2E tests for GHA have been setup to run in parallel. When these run you will see duplicates of each job with a number denoting the instance.

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

:warning: When changes are merged to the main branch (and is automatically deployed to the dev environment), we need to be mindful of any breaking changes with the TFM GraphQL schema/queries or cleaning the dev database. Another team consumes the TFM GraphQL API - we need to notify them of any breaking changes by emailing "IT Mulesoft Technical Support".

### Deploying to test

After merging to main, dev environment will be updated.

To deploy to the test environment, run the `update-test.sh` script in `.github/workflows` directory.
This will take the latest code in the development environment and deploy to test.

The latest deployed commit can be checked by looking at the test/dev branch, or visiting the healthcheck endpoint. E.g: https://tfs-test-fd.azurefd.net/healthcheck

#### Recommended

After deployment, manually check things are OK by submitting a deal to TFM and check that in TFM the deal has data populated.

:warning: There is currently an issue where after deployment, the Number Generator Azure Function App doesn't work correctly.

For a currently unknown reason - the URI's that the Number Generator Function App depends on, can generate incorrect URIs. After a deal is submitted, check the `durable-functions-log` collection Azure Portal. The URIs in any newly created document (created after a deal is submitted after deployment), should have URIs looking something like this:

```shell
statusQueryGetUri" : "https://tfs-test-function-number-generator.azurewebsites.net/runtime..."
```

However after deployment, somehow, it gains what seems to be part of a git commit hash, e.g:

```shell
https://tfs-test-function-number-generator-a1bc23cdfaBa1bc23cdfa.azurewebsites.net/runtim
```

This is invalid and all of the Number Generator tasks generated after deployment will have this. The tasks will be stuck with "Running" status and will never become completed.

Until the underlying issue is fixed, the workaround is to restart the Number Generator Function App in the Azure Portal. The Function app can be found [here](https://portal.azure.com/#@ukef.onmicrosoft.com/resource/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/digital-test/providers/Microsoft.Web/sites/tfs-test-function-number-generator/appServices)

After the restart, newly submitted deals will work.

After this, worth wiping the `durable-functions-log` collection so that there are no dead documents in the collection.

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

## Updating/refreshing the database with mock data

See /utils/mock-data-loader README.

## Azure storage account

This is needed to work with file uploads and azure functions. You can create a storage account inside the Azure Portal GUI:

Home > Services > Storage accounts > Create

Make sure that you select UK South region and the dev/test resource group.

## Number Generator

Each deal & facility submitted to TFM requires a unique ukefID. This is retrieved from the Mulesoft Number Generator API. As this can sometime fail or take too long a background process is started to fetch the ID. This is done in the Number Generator Azure Durable Function.

The steps taken are:

1. Deal is created in Portal/GEF and submitted to TFM
2. TFM calls the Number Generator Azure Function, stores the status endpoint for the function call in the Durable Functions log and returns a ukefID="PENDING"
3. The Number Generator Function tries the number generator a maximum of 5 times before delaring a failure
4. A scheduled job on tfm-api polls the status endpoint for each running job until a result is received
5. If the result is a success then the deal & facilities are updated with the generated IDs
6. If the result is an error, then the entry in the durable functions log collection is updated with the error

## Deal submission to TFM

When a deal is submitted to TFM, there are currently many external API calls made in the TFM submission controller.

Not only does this takes a long time (hindering the user/dev experience), it eats up resources and can be flaky if for example one of the API calls fail. Retries are not setup.

The solution is to move all of these API calls into background processes, with retries.

This will improve the user experience, make it fail safe, and improve the development lifecycle.

## Email notifications

We use [GOV.UK Notify](https://notifications.service.gov.uk) to trigger email notifications at various stages for example:

* When a deal status changes in Portal
* When TFM acknowledges a deal submission
* When a deal is approved or declined in TFM
* When a TFM task is ready to start

Each service that triggers an email has it's own "send email" function:

* Portal (BSS): `sendEmail` (currently calls Notify directly)
* Portal (GEF): `sendEmail` (calls Reference Data Proxy which then calls Notify)
* TFM: `sendTfmEmail` (calls Reference Data Proxy which then calls Notify)

Each function is very similar - at the moment there is not a way to share between different services. Each function requires:

1) Template ID
2) Email address
3) Email variables (object of properties/values to display in the template)

### Notify team members

Only people/email addresses listed in the UKEF Notify 'team members' page, will be able to receive emails and edit templates.

### How to test emails locally

Currently, all emails are sent to a bank's email address associated with the user(s) that have been involved with the deal creation and submission process.

Therefore, to test eamils we just need to change these emails to your own email that is listed in the Notify team members. To guarantee receiving all possible emails for all services, you should change the emails in the following places:

1) `banks` MongoDB collection > `emails` array. Typically the bank with ID 9 is used.
2) `users` MongoDB collection > `bank.emails` array. Typically the user `BANK1_MAKER1` is used

If you want to test an already created BSS deal, you'll need to update `deal.bank.emails`.

The only exception to this is TFM Task emails - these emails are sent to the teams that own the tasks. To test the emails, simply replace the team's email in `tfm-teams` MongoDB collection.

### Notify template limitations

Currenty Notify does not have much support for complex, conditional content - only simple true/false strings. It also doesn't support iteration.

We have a requirement to render multiple lists of facilities, also seperated by facility types. It is not possible to do this out-of-the-box. Therefore, for emails that have lists of facilities, we generate a single string with HTMl/Notify encodings, that will render lists in the Notify template. The single string will be passed as a single email variable to Notify. You can see this in `notify-template-formatters.js`, in TFM API.

We have contacted Notify about this asking for more support.

## Workflow/typeB integration

At the start of the project, the requirement was to submit deals to another system called Workflow. "TypeB" is a Workflow service. Workflow is being retired and we submit to TFM now - so there is no need to integrate with Workflow/TypeB and this has been disabled.

In the codebase there is commented out code for the TypeB functionality just incase we need to use it again. For more information see jira ticket DTFS2-4545 which contains links to the relevant PRs.

## Docker

After some time, docker eats up hard drive space. Clean it up by running

```shell
docker system prune --volumes
```
