# Trade Finance Manager UI (TFM) :computer:

TFM, also known as Trade Finance Manager UI, is an internal application used
for reviewing deals after they have been submitted to UKEF (UK Export
Finance). It uses REST to query the TFM API for deals and facilities,
rendering the data using GovUK and MOJ (Ministry of Justice) design
components, with some custom components as well.

## Purpose :clipboard:

The primary purpose of the TFM UI is to provide a user-friendly interface for
reviewing trade finance deals and related information. The codebase of this UI
should prioritize simplicity and clarity, minimizing the inclusion of complex
logic or business rules whenever possible.

## Prerequisite :key:

Before running the TFM UI locally, ensure that you have an `.env` file
configured. You can use `.env.sample` as a template. Some sensitive variables
may need to be shared among the team.

## Running Locally :computer:

To run the TFM UI locally, follow these steps:

1. Execute `npm run start`.
2. Visit [http://localhost:5003](http://localhost:5003) in your web browser.

Alternatively, you can start all services from the project's root directory
using `npm run start`.

## Login Credentials :key:

Login credentials can be found in the mock users data, specifically in the
file: `utils/mock-data-loader/tfm/users.js`.

## Server import aliases

Use `@tfm-ui/*` for modules under `server`, for example
`@tfm-ui/helpers/user`. The `@ukef/*` aliases remain reserved for the shared
common library.

ESLint's `lint:fix` converts parent-relative imports within `server` to
`@tfm-ui/*`, while preserving same-folder imports and imports outside the
server source tree. This alias is configured in TypeScript, the ts-node
runtime preload, the shared Jest configuration and Webpack.

## Testing :test_tube:

### Run a UI Test Suite :heavy_check_mark:

Verbose with coverage:

```shell
npm run unit-test
```

### **Run a single UI test**

```shell
npm run unit-test ./path/to/file.test.js
```

### Run UI Component Tests :heavy_check_mark:

```shell
npm run component-test
```

### Run a Single UI Component Test :heavy_check_mark:

```shell
npm run component-test ./component-tests/path/to/file.component-test.js
```

### End-to-End Tests :arrows_counterclockwise:

For information about end-to-end tests, please refer to the `e2e-tests`
README.md file.

---
