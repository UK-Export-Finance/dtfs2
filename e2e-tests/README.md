# End-to-End tests 🧪

**Cypress** end-to-end test suites for all UI services and flows:

1. **BSS** (Portal - Bond Support Scheme)
2. **GEF** (General Export Facility)
3. **TFM** (Trade Finance Manager)
4. Submission to **TFM**

## Coverage

[![DTFS](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/count/sefntb/main&style=for-the-badge&logo=cypress)](https://cloud.cypress.io/projects/sefntb/runs)

## Why

End-to-end tests are crucial for ensuring the stability and reliability of our applications. Without e2e tests, issues and regressions can go undetected, potentially causing problems for users.

## Running locally 🏃‍♂️

To run the end-to-end tests locally, follow these steps:

1. Ensure that all services are up and running from the main root by running:

```shell
docker-compose up
```

2. In a second terminal, navigate to the respective folder for the service you want to test (e.g. `./gef`, `./portal`, `./tfm`, `./ukef`).

3. Run one of the following commands to start Cypress:

### **Run an E2E test suite**

```shell
npx cypress run --config video=false
```

### **Run a single E2E test**

If you want to run a specific E2E test file, you can use the following command by specifying the path to the test file:

```shell
npx cypress run --spec "cypress/e2e/**/my-test.spec.js" --config video=false
```

### **For live debugging, open the GUI and select the test:**

```shell
npx cypress open .
```

## Cypress configuration ⚙️

Each test suite has its own `cypress.json` configuration file in its root directory. This JSON file contains URLs for the relevant UI and API endpoints.

Additionally, it includes values for handling timeouts and retries: `pageLoadTimeout` and `retries`.

⚠️ The `pageLoadTimeout` was added because deal submissions can sometimes take time, especially if there are many external API calls involved. Eventually, these API calls will be optimized to reduce submission time and make the E2E tests run more efficiently.

## Directory structure 📂

Each test suite shares a similar directory structure:

| Directory    | Description                           | How it's used                                                                                                       |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| /fixtures    | Mock deals                            | These mock deals are submitted to the API and then used for navigation and data assertion in the UI.                |
| /integration | Spec files and page/element selectors | Spec files define the actual tests, and page/element selectors are used to locate UI elements.                      |
| /plugins     | Unused. Cypress boilerplate           | Not used in this context.                                                                                           |
| /support     | Cypress commands                      | Cypress commands are run in each test to call APIs, add deals to the database, and perform other necessary actions. |
| /videos      | Cypress video captures                | These videos record the tests. You can disable video recording to save time.                                        |
| /screenshots | Cypress screenshots                   | Screenshots are captured in case of test failures for further analysis.                                             |

---
