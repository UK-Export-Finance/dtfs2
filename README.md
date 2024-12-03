# Digital Trade Finance Service :briefcase:

This repository contains the code for the UK Export Finance Trade Finance Service.
This documentation provides a comprehensive overview of the UKEF Digital TradeFinance Service (DTFS), including prerequisites, technology stack, setup instructions, testing procedures, deployment guidelines, and other essential information for the developers.

**Status** 🚦

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![Test coverage](https://codecov.io/github/UK-Export-Finance/dtfs2/graph/badge.svg?token=9NMTKAD9AP)](https://codecov.io/github/UK-Export-Finance/dtfs2)

**CI** 💫

![Lint](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/lint.yml/badge.svg)
![SCA](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/sca.yml/badge.svg)
![QA](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/test.yml/badge.svg)
![Release](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/publish.yml/badge.svg)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1679637fa6fd4778815c0dbf4b3aea5b)](https://app.codacy.com/gh/UK-Export-Finance/dtfs2/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

**CD** 🚀

![Release](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/deployment.yml/badge.svg?branch=dev)
![Release](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/deployment.yml/badge.svg?branch=staging)
![Release](https://github.com/UK-Export-Finance/dtfs2/actions/workflows/deployment.yml/badge.svg?branch=prod)

## Getting Started :rocket:

### Prerequisites :computer:

- Node.js (Version 20 or later) with npm
- Docker and Docker Compose

### Tech Stack :wrench:

- Node.js, NPM
- MongoDB
- Microsoft SQL Server (with TypeORM)
- Docker
- Cypress (E2E tests)
- Webpack
- GovUK and MOJ design systems
- Nunjucks (UI templates)
- [Connect-Flash](https://www.npmjs.com/package/connect-flash)

### Setup :gear:

1. Clone this repository.
2. Run `nvm install VERSION_NUMBER` with the node version number above to ensure you've got the correct Node.js version (then `nvm use VERSION_NUMBER` to use it).
3. Create a single `.env` file in the project root, using `.env.sample` as a base. Some sensitive variables may need to be shared within the team.
4. Generate JWT key pairs with `secrets/set_jwt_keypair.sh` (use `bash secrets/set_jwt_keypair.sh` for Windows).
5. Base64 encode the generated public and private keys and add them to your portal-api `.env` file as follows:
   - `JWT_SIGNING_KEY=your_private_key`
   - `JWT_VALIDATING_KEY=your_public_key`
6. Set UKEF TFM environment variables in your terminal: `UKEF_TFM_API_SYSTEM_KEY` and `UKEF_TFM_API_REPORTS_KEY`.
7. Run `npm run env:copy` to copy your root .env file into all the individual projects that need it.
8. Run `npm ci` in the root folder of the repository. (note: this will install dependencies for the entire project, including those specified in sub-packages. More details on this in the [npm workspaces](./doc/npm-workspaces.md) docs)
9. Start your local environment with `docker-compose up --build`.
10. Create mock data
    - If your work does not involve utilisation reports:
      1. Create mock data by running `npm run load` from the root folder of the repository. This should generate mocks in your database (both Mongo and MSSQL). (for more details on what this does please see [utils docs](./utils/README.md)).
    - If your work involves utilisation reports (including utilisation report E2E tests):
      1. Run the command `npm run load:utilisation-reports` from the root folder of the repository.
         - This runs `npm run db:migrate` in the `libs/common` directory which creates the SQL database tables. This is followed by `npm run load:sql` in the `utils` directory which inserts mock data for MongoDB and MSSQL. This is especially useful for utilisation report work and E2E tests

Recommended: Install a MongoDB client such as Compass or Robo 3T and a MSSQL DB client such as Azure Data Studio.

Note: If you're on Windows and experiencing issues with MongoDB, install mongosh for command-line debugging.

## Running the World Locally :earth_americas:

```shell
npm run start
```

Several services are built:

| Service         | URL                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal UI       | [http://localhost:5000](http://localhost:5000)                                                                                                                        |
| Portal API      | [http://localhost:5001](http://localhost:5001)                                                                                                                        |
| External API    | [http://localhost:5002](http://localhost:5002)                                                                                                                        |
| TFM UI          | [http://localhost:5003](http://localhost:5003)                                                                                                                        |
| TFM API         | [http://localhost:5004](http://localhost:5004)                                                                                                                        |
| Central API     | [http://localhost:5005](http://localhost:5005)                                                                                                                        |
| GEF             | [http://localhost:5006](http://localhost:5006)                                                                                                                        |
| MongoDB         | `root:r00t@localhost:27017` (Connect via MongoDB client)                                                                                                              |
| MSSQL Server DB | SSMS: `Server=localhost:1433;Database=DTFS;User Id=dtfs;Password=AbC!2345;`<br/>DataGrip: `jdbc:sqlserver://localhost:1433;database=DTFS;user=dtfs;password=AbC!2345` |

To access GEF locally, use [http://localhost](http://localhost).

## Stopping the Local Environment :stop_sign:

To stop the local environment, simply exit the running terminal and run:

```shell
npm run stop
```

## Login Credentials :key:

- For Portal (BSS & GEF) mock users: [utils/mock-data-loader/portal-users/index.js](utils/mock-data-loader/portal-users/index.js)
- For Trade Finance Manager (TFM) mock users: [utils/mock-data-loader/tfm/mocks/users.js](utils/mock-data-loader/tfm/mocks/users.js) (use the `username` to log in as opposed to the `email`)

## Environment Variables :keycap_ten:

As this project interfaces with various 3rd party APIs, it requires a range of environment variables to manage this and work with the repository locally. All variables are listed in a private spreadsheet, which should be shared with new engineers and updated as necessary.

These variables are stored as secrets in the GitHub repository. When deploying to an Azure environment, Azure automatically retrieves the GitHub secrets and updates the environment accordingly. To update a secret:

1. Update the secret in the spreadsheet.
2. Update the secret in GitHub secrets.
3. Deploy to the development environment.
4. Deploy to the test environment.

## Testing :test_tube:

### Run All Tests (E2E, API, and UI) :rocket:

With Docker running, execute all tests using the following command:

```shell
npm run pipeline
```

### E2E Tests :rocket:

From the respective folder (./e2e-tests/portal, ./e2e-tests/gef, ./e2e-tests/ukef, ./e2e-tests/tfm):

#### Run an E2E Test Suite :heavy_check_mark:

```shell
npx cypress run --config video=false
```

#### Run a Single E2E Test :heavy_check_mark:

```shell
npx cypress run --spec "cypress/e2e/**/my-test.spec.js" --config video=false
```

#### For Live Debugging, Open the GUI and Select the Test :mag_right:

```shell
npx cypress open .
```

### API Tests :rocket:

From the respective folder (./portal-api, ./dtfs-central-api, ./trade-finance-manager-api):

#### Run an API Test Suite :heavy_check_mark:

```shell
npm run api-test
```

#### Run a Single API Test :heavy_check_mark:

```shell
npm run api-test "**/*/deals-party-db.api-test.js"
```

### UI Tests :rocket:

From the respective folder (./portal, ./gef-ui, ./trade-finance-manager-ui):

#### Run a UI Test Suite :heavy_check_mark:

```shell
npm run unit-test
```

#### Run a Single UI Test :heavy_check_mark:

```shell
npm run unit-test /path/to/file.test.js
```

## Building CSS and JS :wrench:

The `gef-ui`, `portal` and `trade-finance-manager-ui` folders/services all have a `public` folder which contains compiled/minified CSS and JS that is used in the running application.

These CSS and JS files are built from SCSS and JS source files using a tool called Webpack. You can check which SCSS and JS source files are used in the `webpack.common.config.js` file (each relevant service has one). In general, each of the three services has:

- A `scripts` folder containing the source JS.
- A `styles` folder containing the source SCSS.

The developer should run `npm run build` inside the service in question to recompile the CSS and JS in the `public` folder after making any changes to the source files or their dependencies.

### Sub-resource integrity [(SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)

Client side JavaScript files are protected by SRI security feature which allows the browser to verify the authenticity of the JavaScript files in use.

:warning: If a client side JavaScript file is changed and recompiled during `npm run build`, a new file hash will need to be generated. Otherwise, the script will not be executed.

This can be done by updating the `integrity` attribute in any HTML/Nunjucks `script` tags that use the file to reflect the new hash of the recompiled file (a good place to check for these `script` tags is the `templates/index.njk` file in the service).

There are two ways to update these:

1. (Preferred) Render a template that uses the script in a browser; a console error should give you the hash of the recompiled file.
2. Run `cat FILENAME.js | openssl dgst -sha512 -binary | openssl base64 -A` on each. Note -- GEF UI references Portal UI's javascript files when using the reverse proxy, so use the hashes from Portal UI's `.js` files in GEF-UI.

## Linting :mag_right:

In the root directory or any service, run:

```shell
npm run lint
```

## Git Workflow :octocat:

1. Create a branch and PR clearly describing the change, along with the Jira ticket number.
2. The PR will run tests for the affected services.
3. Once the PR tests pass, another engineer reviews and approves the PR.
4. The PR is then merged into the main branch.

GitHub Actions will automatically run a build and push of container images to Azure, where they will be picked up and deployed in the Dev environment.

E2E tests for GHA have been set up to run in parallel. When they run, you will see duplicates of each job with a number denoting the instance.

## Continuous Integration (CI) :arrows_counterclockwise:

### Environment

Several environments are used for CI/CD:

- [Dev Environment](http://tfs-xxx-fd.azurefd.net/)
- [Test Environment](http://tfs-xxx-fd.azurefd.net/)
- [Production Environment](http://tfs-xxx-fd.azurefd.net/)

### GEF

The GEF test environment is hosted on the same URL as Portal v2. Following steps would allow access to GEF portal.

- Log in to Portal v2: [https://tfs-xxx-fd.azurefd.net](https://tfs-xxx-fd.azurefd.net)
- Manually navigate to the GEF URL to create a new GEF application: [https://tfs-xxx-fd.azurefd.net/gef/mandatory-criteria](https://tfs-xxx-fd.azurefd.net/gef/mandatory-criteria)
- Alternatively, visit an existing GEF deal by ID: [http://tfs-xxx-fd.azurefd.net/gef/deals/1](http://tfs-xxx-fd.azurefd.net/gef/deals/1)

## Deployment :rocket:

All environments require a manual trigger to ensure stability, free from CI/CD interference, and ready for QA and user testing.

### Deploying to Dev :construction_worker:

You can check the latest deployed commit by looking at the test/dev branch or visiting the health check endpoint, e.g., [https://tfs-xxx-fd.azurefd.net/healthcheck](https://tfs-xxx-fd.azurefd.net/healthcheck).

### Deploying to Test :construction_worker:

You can check the latest deployed commit by looking at the test/dev branch or visiting the health check endpoint, e.g., [https://tfs-xxx-fd.azurefd.net/healthcheck](https://tfs-xxx-fd.azurefd.net/healthcheck).

### Deploying to Prod :construction_worker:

You can check the latest deployed commit by looking at the test/dev branch or visiting the health check endpoint, e.g., [https://tfs-xxx-fd.azurefd.net/healthcheck](https://tfs-xxx-fd.azurefd.net/healthcheck).

### Recommended :bulb:

After deployment, manually check if everything is working correctly by submitting a deal to TFM and verifying that the deal has data populated. Please note that there is currently an issue where the Number Generator Azure Function App may not work correctly after deployment. If you encounter this issue, restart the Number Generator Function App in the Azure Portal. This should resolve the problem, and newly submitted deals will work as expected. Make sure to wipe the `durable-functions-log` collection to remove any dead documents.

## Updating/Refreshing the Database with Mock Data :floppy_disk:

Refer to the `/utils/mock-data-loader` README for instructions.

## Azure Storage Account :file_folder:

A Microsoft Azure storage account is required for working with file uploads and Azure functions. You can create a storage account within the Azure Portal GUI:

Home > Services > Storage accounts > Create

Ensure that you select the UK South region and the dev/test resource group.

## Number Generator :1234:

Each deal and facility submitted to TFM requires a unique ukefID, which is obtained from the APIM MDM Number Generator API. A background process is started to fetch the ID, and this process is managed by the Number Generator Azure Durable Function. The steps involved are as follows:

1. A deal is created in Portal/GEF and submitted to TFM.
2. TFM calls the Number Generator Azure Function, stores the status endpoint for the function call in the Durable Functions log, and returns a `ukefID` of "PENDING."
3. The Number Generator Function attempts to generate the number a maximum of 5 times before declaring a failure.
4. A scheduled job on `tfm-api` polls the status endpoint for each running job until a result is received.
5. If the result is successful, the deal and facilities are updated with the generated IDs.
6. If the result is an error, the entry in the Durable Functions log collection is updated with the error.

## Deal Submission to TFM :briefcase:

When a deal is submitted to TFM, many external API calls are currently made in the TFM submission controller. This process can be slow, resource-intensive, and prone to failures if one of the API calls encounters an issue. Retries are not currently configured.

To address these issues, the plan is to move all these API calls into background processes with automatic retries. This will enhance the user experience, make the process fail-safe, and improve the development workflow.

## Email Notifications :email:

Email notifications are sent through MDM APIM using [GOV.UK Notify](https://notifications.service.gov.uk) at various stages, such as:

- When a deal status changes in Portal.
- When TFM acknowledges a deal submission.
- When a deal is approved or declined in TFM.
- When a TFM task is ready to start.

Each service that triggers an email has its "send email" function, including Portal (BSS & GEF) and TFM. Each function requires the following:

1. Template ID.
2. Email address.
3. Email variables (an object of properties/values to display in the template).

Notify team members must be listed in the UKEF Notify "team members" page to receive emails and edit templates.

### How to Test Emails Locally :mailbox:

To test emails locally, replace the bank's email address associated with the user(s) involved in the deal creation and submission process with your own email address, provided that it's listed in the Notify team members. Specifically, update the following:

1. `banks` MongoDB collection > `emails` array (typically, use the bank with ID 9).
2. `users` MongoDB collection > `bank.emails` array (typically, use the user `BANK1_MAKER1`).
3. TFM Task emails are sent to the teams responsible for the tasks. To test these emails, replace the team's email in the `tfm-teams` MongoDB collection.

### Notify Template Limitations :page_facing_up:

Notify currently has limited support for complex, conditional content, and it does not support iteration. For emails with lists of facilities, a workaround is used to generate a single string with HTML/Notify encodings that render lists in the Notify template. This single string is passed as a single email variable to Notify, as implemented in `notify-template-formatters.js` within the TFM API.

## Docker :whale:

After some time, Docker can consume a significant amount of hard drive space. To clean it up, run the following command:

```shell
docker system prune --volumes
```

## Cookies :cookie:

Cookies are used for persistent sessions (login) and CSRF protection. They are configured with the following flags and names:

- Secure
- HTTP only
- SameSite as `Strict`
- `__Host-` prefix (for Session cookie only)

Cookie Names:

- Session: `__Host-dtfs-session`
- CSRF: `_csrf`

---
