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
npm run start
```

2. If SQL db migrations have not been run since you last rebuilt your SQL container or if there are new migrations, then you need to run from the main root:

```shell
npm run db:migrate -w libs/common
```

3. In a second terminal, navigate to the `e2e-tests` folder
4. Make sure you have a copy of your `.env` file within the folder for the service you want to test. (e.g. if you want to test the `gef` service, copy your top level `.env` file into the `./gef` directory)
5. Run one of the following commands to start Cypress:

### **Running the E2E tests using the GUI**

To run a suite the tests using the Cypress GUI (graphical user interface), where you see the tests happen real-time on a browser window, use:

```shell
npx cypress open --project ./{service name}
```

e.g. `npx cypress open --project ./gef`

This mode is helpful for live debugging.

### **Running the E2E tests in headless mode**

To run a suite in headless mode (without displaying the GUI) use:

```shell
npx cypress run --project ./{service name}
```

If you want to run a specific E2E test file, you can use the following command by specifying the path to the test file:

```shell
npx cypress run --spec "cypress/e2e/**/my-test.spec.js"
```

## Gotchas

If you haven't run migrations then any tests depending on the SQL database will fail.
Most commonly this will cause the test to fail with the slightly obscure message:

```shell
Error: Invalid object name 'PaymentMatchingTolerance'.
```

Where 'PaymentMatchingTolerance' will be replaced by whichever SQL table is trying to be accessed but does not exist.

## Cypress configuration ⚙️

Each test suite has its own `cypress.config.js` file in its root directory. This JSON file contains URLs for the relevant UI and API endpoints.

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

### Aliases

When creating custom cypress commands, the `cypress/unsafe-to-chain-command` lint warning can sometimes appear. The reason for this warning is usually not immediately obvious, but there are some examples in the cypress documentation which explain the concept of "unsafe chaining" quite well. Consider the `.each` command which iterates through array-like objects. The below code will extract and iterate over all the list items inside an unordered list in the DOM and yield the individual list items to the `$li` variable:

```javascript
cy.get('ul > li').each(($li) => {});
```

Now, imagine you want to yield each `<p>` element inside of `$li` to the next part of the command chain in the following way:

```javascript
cy.get('ul > li')
  .each(($li) => {
    return cy.wrap($li).find('p');
  })
  .then(($p) => {});
```

Unfortunately, `$p` will not be the `<p>` DOM element inside of the current `$li`, but will instead be the original list item yielded in the previous `.each` command. For this reason, chaining further commands which rely on the subject after `.each` is considered "unsafe" (you can read [here](https://docs.cypress.io/api/commands/each) for more details about `.each` specifically).

Moving back to custom commands, these can sometimes show this lint warning despite appearing to yield the correct values and working in the test environment (see an example of this [here](https://github.com/cypress-io/cypress-example-kitchensink/issues/661)). The method for getting around this issue in this project has been to introduce an `ALIAS_KEY` constant which can be used to access values yielded from custom commands in the following way.

```javascript
// Custom cypress command which does something with the input and then yields a value
Cypress.Commands.add('insertAndYieldLength', (itemToInsert) => {
  cy.wrap(itemToInsert).then((item) => {
    insertItem(item); // generic (external) function
  });
  cy.wrap(itemToInsert.length).as(ALIAS_KEY.INSERT_AND_YIELD_LENGTH);
});

// Accessing the result of that command (in a test)
cy.insertAndYieldLength(itemToInsert);
cy.get(`@${ALIAS_KEY.INSERT_AND_YIELD_LENGTH}`).then((length) => {
  // do something with length
});
```

There is also a helper function called [`aliasSelector`](./support/alias-selector.js) which abstracts the logic of putting the `@` before the alias key.

By yielding the results of custom commands in this way, chaining will always be safe as calling `cy.get` for the yielded value will only run if that value is correctly defined and wrapped in your custom command. Working with custom commands in this way also reduces the chances of your yielded value not being what you expect due to the asynchronous nature of cypress, as `cy.get` will only be called after the previous command has finished executing. For further reading about cypress aliases, refer to the [official documentation](https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Aliases).
