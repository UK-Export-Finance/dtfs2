# e2e-tests

[Cypress](http://cypress.io) End to end test suites for all UI services and flows:

1) BSS (Portal - Bond Support Scheme)
2) GEF (General Export Facility)
3) TFM (Trade Finance Manager)
4) Submission to TFM from BSS/Portal

## Why

Without e2e tests, things could break without us knowing.

## Running locally

1: Make sure that you have everything running from the main root:

```shell
docker-compose up
```

2: In a second terminal, navigate to the respective folder (./portal, ./gef, ./submit-to-trade-finance-manager, ./trade-finance-manager).

3: Run any of the following commands to start Cypress

### **Run an E2E test suite**

```shell
npx cypress run --config video=false
```

### **Run a single E2E test**

```shell
npx cypress run --spec "cypress/integration/**/my-test.spec.js" --config video=false
```

### **For live debugging, open the GUI and select the test:**

```shell
npx cypress open .
```

## Cypress configuration

Each test suite has a `cypress.json` in the route. This JSON contains URLs for the relevant UI and API.

There is also some values for handling timeouts and errors: `pageLoadTimeout` and `retries`.

:warning: `pageLoadTimeout` was added because sometimes deal submission can take some time (due to a large amount of external API calls). Eventually, these API calls will be moved to a background service which will not only reduce submission type, but make the e2e tests run quicker.

## Directory structure

Each test suite has the same root directory structure.

| Directory | Description | How it's used |
| ------- | --- | --- |
| /fixtures | Mock deals | Submitted to API, then used to navigate and assert data in the UI. |
| /integration | Spec files and page/element selectors | - | 
| /plugins | Unused. Cypress boilerplate | - |
| /support | Cypress commands | In each test, cypress commands are run to call APIs to e.g add a deal to the database. |
| /videos | Cypress video captures | Records tests. Disable to save speed.
| /screenshots | Cypress screenshots | Saves screenshots on failed tests.
