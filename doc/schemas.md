# Schemas

We use Zod to define schemas on DTFS. These schemas serve as a way to define the shape of data that is passed around the application.

We can use these schemas to validate data in multiple ways, as well as transform data and generate TypeScript types.

They are incredibly powerful and useful for ensuring that data is correct and consistent throughout the application.

The majority of schemas are defined in the `libs/common/src/schemas` directory. This allows us to use similar schemas in the front and back end when needed.

## Schema tests

We have been testing our schemas in a variety of ways. These tests have proven long and difficult to maintain, with a lot of repetition and boilerplate.

As a result, we are working towards a new approach to schema testing to make writing tests easy to write. This approach sees:

- Each schema having their own tests that reference `withSchemaValidationTests`, with a simple test case definition.
- `withSchemaValidationTests` handles the orchestration of combining any schema-wide test options (such as `isPartial` and `isStrict`) and orchestrates the testing of each test case though `withTestsForTestcase`
- `withTestsForTestcase` handles the dispatching of test cases to the relevant test files for the type of schema being tested.
- These test case files are broken down into:
  - primitive types (native in JS, ie `with-string.tests`),
  - custom types (based on primitives, but with additional validation, for instance a number being non-negative, ie `with-unix-timestamp-milliseconds-schema.tests`),
  - schemas (reusable tests for whole schemas that are used in other schemas, ie `with-entra-id-user-schema.tests`)
  - transformations (schemas that transform data, for instance changing a string to a date -- ie `with-iso-date-time-stamp-to-date.schema`)

The result of this structure means that the majority of tests will be effectively 'free' to write. The only exception here are schemas that use types or schemas where a test case does not already exist.

### Note on backend schema tests

We currently run our UI tests using mongodb in a [jsdom environment] (https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest). E2E tests also run in the jsdom environment.

As part of our schema tests, we export tests that contain `mongodb`'s `ObjectId`. This `ObjectId` eventually references the `whatwg-url` library, which in turn calls `TextEncoder`. `TextEncoder` is a node global and is not available in the `jsdom` environments.

As we should only be using `ObjectId` in the backend, we have seperated out these test files into `backend-filename` tests and do not export these by default in `libs/common` (much like other backend-specific functionality in `libs/common`).

### Writing tests

To test -- We create a new file, referencing the `withSchemaValidationTests` function, and follow the instructions found in `with-schema-validation.tests.ts`.

```ts
// example.schema.ts
import { EXAMPLE_SCHEMA } from './example.schema';

describe('EXAMPLE_SCHEMA', () => {
  withSchemaValidationTests();
  // Follow examples in with-schema-validation.tests.ts
});
```

9 out of 10 times when you write a test, the above will allow you to write quick, comprehensive tests for your schema.

However, sometimes you'll have created a new nested schema or type that doesn't have a test case yet. In this case, you'll need to create a new test file. These go in `\libs\common\src\test-helpers\schemas` (in the correct folder, as specified above).

### To create your own primitive/custom type test:

**Note: If your schema requires testing ObjectId use the folders and files prefixed `backend`**

- Create a new file in the correct folder (ie `with-string.tests.ts`)
- Follow the existing pattern (see `with-string.tests.ts` for an example)
- Ensure you have `withDefaultTestCases` in your test file
- Add any type specific options as required (see `with-array.tests.ts` for an example)
- Add export of the test to the `index.ts` file in the same folder
- Add your test case name to `with-test-for-test-case.type` in the `TestCaseWithType` declaration
- Add your test case to the `withTestsForTestcase` function to call your test case when provided with the test case name as the `type` in a `testCase`
- This can now be called as

  ```ts
  {
      testCases: [
          {
              parameterPath: 'path to parameter in schema being tested',
              type: 'your test case name',
              schema: SCHEMA_YOU_ARE_TESTING,
              options: {
                  // any default options you want to pass to your test case
                  // any type specific options you want to pass to your test case
              }
          },
      ],
  }
  ```

### To create your own reusable schema / transformation test:

n.b. transformation tests use a different test case type to allow access to a function to get the value of the transformed payload -- pay attention to types if working on a transformation test.

- Create a new file in the correct folder (ie `with-audit-database-record-schema.tests.ts`)
- Follow the existing pattern (see `with-audit-database-record-schema.tests.ts` for an example)
- Ensure you have `withDefaultTestCases` in your test file
- Add any type specific options as required (see `with-array.tests.ts` for an example)
- Add export of the test to the `index.ts` file in the same folder
- Add your test case name to `with-test-for-test-case.type` in the `TestCaseWithType` declaration
- Add your test case to the `withTestsForTestcase` function to call your test case when provided with the test case name as the `type` in a `testCase`
- This can now be called as

  ```ts
  {
      testCases: [
          {
              parameterPath: 'path to parameter in schema being tested',
              type: 'your test case name',
              schema: SCHEMA_YOU_ARE_TESTING,
              options: {
                  // any default options you want to pass to your test case
                  // any type specific options you want to pass to your test case
              }
          },
      ],
  }
  ```

- Create a test for this new schema in `libs/common/src/schemas`, and call your new test file (see audit-database-record.test.ts).
