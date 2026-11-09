# Onboarding Guide

Welcome to the Digital Trade Finance Service (DTFS) team! :wave: This guide is
the starting point for new engineers. It pulls together the context, setup
steps and links you need for your first few days, and points to the more
detailed documentation that already exists in this repository.

If you only read one other document, read the root [README.md](../README.md) --
it is the source of truth for setup, running and testing the project. This
guide exists to orient you first and link you to the right place second.

## 1. What is DTFS? :briefcase:

DTFS (Digital Trade Finance Service) is UK Export Finance's (UKEF) platform
for managing trade finance products. Exporters' banks submit **deals** (made
up of one or more **facilities**, e.g. bonds or loans) which UKEF then
reviews, prices and manages through to maturity.

### Domain glossary

| Term         | Meaning                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **BSS**      | Bond Support Scheme -- one of the original products supported by Portal.                                         |
| **EWCS**     | Export Working Capital Scheme -- the other original Portal product, usually grouped with BSS.                    |
| **GEF**      | General Export Facility -- a newer product with its own UI (`gef-ui`) that reuses `portal-api` `/gef` endpoints. |
| **TFM**      | Trade Finance Manager -- the internal UKEF caseworker application used once a deal has been submitted.           |
| **Deal**     | A submission from a bank, containing one or more facilities.                                                     |
| **Facility** | A single bond, loan (BSS/EWCS)or Cash, Contingent (GEF) or other financial product within a deal.                |
| **Case**     | In TFM, a deal plus its facilities and TFM-specific data (tasks, parties, etc.).                                 |

### Services at a glance

| Service                                                 | Purpose                                                                                                 | Local URL                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [portal-ui](/portal-ui)                                 | UI for banks submitting BSS/EWCS deals                                                                  | <http://localhost:5000>                                         |
| [portal-api](/portal-api)                               | API backing `portal-ui` and `gef-ui` (BSS endpoints in `/server/v1`, GEF endpoints in `/server/v1/gef`) | <http://localhost:5001>                                         |
| [external-api](/external-api)                           | Handles consumption of, and communication with, external/3rd-party APIs                                 | <http://localhost:5002>                                         |
| [trade-finance-manager-ui](/trade-finance-manager-ui)   | Internal UI for UKEF caseworkers reviewing submitted deals                                              | <http://localhost:5003>                                         |
| [trade-finance-manager-api](/trade-finance-manager-api) | API backing `trade-finance-manager-ui`, manages TFM "cases"                                             | <http://localhost:5004>                                         |
| [dtfs-central-api](/dtfs-central-api)                   | Intermediary API handling submissions and data flow between other services                              | <http://localhost:5005>                                         |
| [gef-ui](/gef-ui)                                       | UI for banks submitting GEF deals                                                                       | <http://localhost:5006> (via reverse proxy: <http://localhost>) |
| [reverse-proxy](/reverse-proxy)                         | Nginx config serving `portal-ui` and `gef-ui` from one location                                         | <http://localhost>                                              |
| [azure-functions](/azure-functions)                     | Background tasks triggered during deal submission to UKEF/TFM                                           | n/a                                                             |
| [libs/common](/libs/common)                             | Shared code (schemas, types, helpers) used across services                                              | n/a (imported as `@ukef/dtfs2-common`)                          |
| [e2e-tests](/e2e-tests)                                 | Cypress end-to-end tests covering BSS, GEF, TFM and submission flows                                    | n/a                                                             |
| [utils](/utils)                                         | Mock data loader and data migration scripts                                                             | n/a                                                             |

Data is stored in **MongoDB** (document data such as deals and facilities) and
**Microsoft SQL Server** via TypeORM (relational data, e.g. for utilisation
reports). See [doc/sql-db.md](./sql-db.md) for details on the SQL database and
running migrations.

This project is a monorepo managed with **npm workspaces** -- see
[doc/npm-workspaces.md](./npm-workspaces.md) for how packages relate to each
other and how to share code via [libs/](/libs).

## 2. First-time setup :gear:

Follow the ["Getting Started"](/README.md#getting-started-rocket) section of
the root README step by step. The short version:

1. Install the Node.js version from [package.json](/package.json) `engines`
   field (use `nvm install`/`nvm use`) and Docker + Docker Compose.
2. Copy `.env.sample` to a single root `.env` file and fill in required
   values (ask the team for any shared secrets).
3. Generate JWT key pairs with `secrets/set_jwt_keypair.sh` and save the
   Base64-encoded private and public keys in the root `.env` as
   `JWT_SIGNING_KEY` and `JWT_VALIDATING_KEY`, respectively.
4. Run `npm ci` from the repository root (installs all workspaces).
5. Run `npm run env:copy` to copy the root `.env` into every sub-project that
6. Run `docker-compose up --build` to start supporting services.
7. Load mock data with `npm run load` (or `npm run load:utilisation` if your
   work touches utilisation reports/SQL).
8. Start everything with `npm run start`.

Mock login credentials are defined in code, not the database seed scripts
directly:

- Portal (BSS & GEF): [utils/mock-data-loader/portal-users/index.js](/utils/mock-data-loader/portal-users/index.js)
- TFM (log in with `username`, not `email`): [utils/mock-data-loader/tfm/mocks/users.js](/utils/mock-data-loader/tfm/mocks/users.js)

If something doesn't work the way you expect, check
[doc/gotchas.md](./gotchas.md) first -- it's a running list of issues other
engineers have already hit and resolved.

## 3. Day-to-day development :wrench:

- **Linting**: `npm run lint:all` from the root, or `npm run lint` in a microservice.
- **Type checking**: `npm run type-check:all` from the root.
- **Formatting**: project uses Prettier; `npm run prettier:fix:all` from the
  root fixes everything.
- **Tests**: there's no single command that runs every suite -- run each
  individually: `npm run api-test` (API, from `portal-api`,
  `dtfs-central-api` or `trade-finance-manager-api`), `npm run unit-test`
  (UI, from `portal-ui`, `gef-ui` or `trade-finance-manager-ui`), and
  `npx cypress run --project=<name>` (E2E, from `e2e-tests`) -- see the
  ["Testing"](/README.md#testing-test_tube) section of the README for exact
  commands.
- **CSS/JS builds**: `portal-ui`, `gef-ui` and `trade-finance-manager-ui` all
  compile SCSS/JS with Webpack into a `public` folder. Run `npm run build` in
  the service after changing source files, and read the note on
  [Sub-resource Integrity](/README.md#sub-resource-integrity-sri) -- changed
  client JS needs its SRI hash updated in the relevant Nunjucks template or
  the script simply won't run in the browser.
- **Commits**: this repo uses
  [Conventional Commits](https://conventionalcommits.org) (enforced by
  commitlint + husky).
- **Docstrings**: see [doc/docstring.md](./docstring.md) for the expected
  JSDoc/TSDoc style.
- **Schemas**: data shapes are defined with Zod, mostly under
  `libs/common/src/schemas` so both frontend and backend can share them -- see
  [doc/schemas.md](./schemas.md).
- **Stateful entities**: anything with a lifecycle (e.g. utilisation report
  status) is modelled as a state machine -- see
  [doc/state-machines.md](./state-machines.md) before adding new states or
  transitions by hand.
- **TFM SSO**: if you're working on TFM authentication, read
  [doc/tfm-sso.md](./tfm-sso.md).

## 4. Git & PR workflow :octocat:

1. Create a branch and open a PR that clearly describes the change, including
   the Jira ticket number.
2. CI runs lint, type-check and tests for the affected services.
3. Once CI passes, another engineer reviews and approves the PR.
4. The PR is merged into `main`. Dev deployments run separately on schedules
   or pushes to the deployment branches (`dev` and `dev1`).

See the ["Git Workflow"](/README.md#git-workflow-octocat) and
["Continuous Integration"](/README.md#continuous-integration-ci-arrows_counterclockwise)
sections of the README for more on environments and deployments.

## 5. Where to go next

| Topic                                     | Document                                                                                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full setup, running, testing & deployment | [README.md](/README.md)                                                                                                                                          |
| npm workspaces & shared code              | [doc/npm-workspaces.md](./npm-workspaces.md)                                                                                                                     |
| SQL database & migrations                 | [doc/sql-db.md](./sql-db.md)                                                                                                                                     |
| Zod schemas                               | [doc/schemas.md](./schemas.md)                                                                                                                                   |
| State machines                            | [doc/state-machines.md](./state-machines.md)                                                                                                                     |
| Docstring conventions                     | [doc/docstring.md](./docstring.md)                                                                                                                               |
| TFM SSO                                   | [doc/tfm-sso.md](./tfm-sso.md)                                                                                                                                   |
| Known gotchas / troubleshooting           | [doc/gotchas.md](./gotchas.md)                                                                                                                                   |
| Individual service details                | Each service's own `README.md` (e.g. [portal-api/README.md](/portal-api/README.md), [trade-finance-manager-api/README.md](/trade-finance-manager-api/README.md)) |

## 6. First week checklist

- [ ] Complete the local setup above and confirm all services start with
      `npm run start`.
- [ ] Log in to Portal, GEF and TFM locally using the mock users.
- [ ] Submit a mock deal in Portal/GEF and find it in TFM to see the full
      submission flow end-to-end.
- [ ] Run an API test suite (`npm run api-test`), a UI test suite
      (`npm run unit-test`) and at least one Cypress E2E suite
      (`npx cypress run --project=<name>`) locally.
- [ ] Read through [doc/gotchas.md](./gotchas.md) so you recognise common
      errors if you hit them.
- [ ] Find out who to ask for `.env` secrets and access to the private
      environment-variables spreadsheet (see
      ["Environment Variables"](/README.md#environment-variables-keycap_ten)
      in the README).
