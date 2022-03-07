# Trade Finance Manager UI

Also known as TFM; This UI is an internal application used to review deals after they have been submitted to UKEF.

The UI uses GraphQL to query [TFM API](trade-finance-manager-api) for deals and facilities, then renders the data with GovUK and MOJ design components. There are some custom components.

The only logic in the codebase is for page routes, controllers, form validation and user permissions. The UI should be kept as simple as possible - only adding logic or business rules when it absolutely needs to be in the UI.

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

1. `docker-compose up`
2. Visit http://localhost:5003 in your browser

Alternatively, every service can be started from the root directory (`docker-compose up`).

## Login credentials

See mock users: utils/mock-data-loader/tfm/users.js

## Testing

### **Run a UI test suite**

```shell
npm run test
```
### **Run a single UI test**

```shell
npm run test /path/to/file.test.js
```

### **Run UI component tests**

```shell
npm run component-test
```

### **Run a single UI component tests**

```shell
npm run component-test ./component-tests/path/to/file.component-test.js
```

### **End to end tests**

See e2e-tests README.md

# DTFS