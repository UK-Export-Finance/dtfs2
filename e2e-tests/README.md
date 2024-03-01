# End-to-End tests 🧪

**Cypress** end-to-end test suites for all UI services and flows:

1) **BSS** (Portal - Bond Support Scheme)
2) **GEF** (General Export Facility)
3) **TFM** (Trade Finance Manager)
4) Submission to **TFM**

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

### Importing from `@ukef/dtfs2-common`

Some test fixtures which are used by both `utils/mock-data-loader` and `e2e-tests` are defined in the `libs/common` workspace (see [portal users](../libs/common/src/test-helpers/mock-data/portal-users.mock.ts), for example). However, we cannot import these modules directly in cypress files which are served to the cypress client as the import requires a `node` environment, whereas cypress runs in-browser. To overcome this, constants imported from `libs/common` should be stored as cypress environment variables which can be accessed via the `Cypress.env` command. These env variables are defined in [`e2e-tests/support/cypress-env.ts`](./support/cypress-env.ts), with a `getCypressEnvVariable` helper function and `CYPRESS_ENV_KEY` constant defined in [e2e-fixtures](./e2e-fixtures/). An example implementation of the helper function and constant can be seen in [the portal users fixture](./e2e-fixtures//portal-users.fixture.js). The types have also been defined in such a way that you will get a `tsc` failure if you add a new environment variable to [`e2e-tests/support/cypress-env.ts`](./support/cypress-env.ts) without updating the `CYPRESS_ENV_KEY` constant.

## Directory structure 📂

Each test suite shares a similar directory structure:

| Directory | Description | How it's used |
| --------- | ----------- | ------------- |
| /fixtures | Mock deals | These mock deals are submitted to the API and then used for navigation and data assertion in the UI. |
| /integration | Spec files and page/element selectors | Spec files define the actual tests, and page/element selectors are used to locate UI elements. |
| /plugins | Unused. Cypress boilerplate | Not used in this context. |
| /support | Cypress commands | Cypress commands are run in each test to call APIs, add deals to the database, and perform other necessary actions. |
| /videos | Cypress video captures | These videos record the tests. You can disable video recording to save time. |
| /screenshots | Cypress screenshots | Screenshots are captured in case of test failures for further analysis. |

---

### Aliases

When creating custom cypress commands, the `cypress/unsafe-to-chain-command` lint warning can sometimes appear. The reason for this warning is usually not immediately obvious, but there are some examples in the cypress documentation which explain the concept of "unsafe chaining" quite well. Consider the `.each` command which iterates through array-like objects. The below code will extract and iterate over all the list items inside an unordered list in the DOM and yield the individual list items to the `$li` variable:

```javascript
cy.get('ul > li').each(($li) => {

});
```

Now, imagine you want to yield each `<p>` element inside of `$li` to the next part of the command chain in the following way:

```javascript
cy.get('ul > li').each(($li) => {
  return cy.wrap($li).find('p');
}).then(($p) => {

});
```
Unfortunately, `$p` will not be the `<p>` DOM element inside of the current `$li`, but will instead be the original list item yielded in the previous `.each` command. For this reason, chaining further commands which rely on the subject after `.each` is considered "unsafe" (you can read [here](https://docs.cypress.io/api/commands/each) for more details about `.each` specifically).

Moving back to custom commands, these can sometimes show this lint warning despite appearing to yield the correct values and working in the test environment (see an example of this [here](https://github.com/cypress-io/cypress-example-kitchensink/issues/661)). The method for getting around this issue in this project has been to introduce an `ALIAS_KEY` constant which can be used to access values yielded from custom commands in the following way.

```javascript
// Custom cypress command which does something with the input and then yields a value
Cypress.Commands.add('insertAndYieldLength', (itemToInsert) => {
  cy.wrap(itemToInsert)
    .then((item) => {
      insertItem(item); // generic (external) function
    });
  cy.wrap(itemToInsert.length).as(ALIAS_KEY.INSERT_AND_YIELD_LENGTH);
});

// Accessing the result of that command (in a test)
cy.insertAndYieldLength(itemToInsert);
cy.get(`@${ALIAS_KEY.INSERT_AND_YIELD_LENGTH}`)
  .then((length) => {
    // do something with length
  });
```

There is also a helper function called [`aliasSelector`](./support/alias-selector.js) which abstracts the logic of putting the `@` before the alias key.

By yielding the results of custom commands in this way, chaining will always be safe as calling `cy.get` for the yielded value will only run if that value is correctly defined and wrapped in your custom command. Working with custom commands in this way also reduces the chances of your yielded value not being what you expect due to the asynchronous nature of cypress, as `cy.get` will only be called after the previous command has finished executing. For further reading about cypress aliases, refer to the [official documentation](https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Aliases).