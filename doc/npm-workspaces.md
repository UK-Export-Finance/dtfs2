# npm workspaces

[npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) is used to help manage the multiple packages included in this project.

## Benefits of using npm workspaces

- when running `npm install` from the root directory, common dependencies across all sub-packages will be hoisted to the root `node_modules` with only conflicting dependencies installed in the sub-package `node_modules`. This means:
  - faster installation of all packages
  - less space taken up by duplicate dependencies
- commands for all projects can easily be run from the root directory. e.g. `npm run lint --workspaces` will run all individual `lint` scripts in each of the sub-packages included in the workspace
- workspaces will auto-symlink sub-packages so that code can easily be shared across packages

## Code sharing across packages

:warning: Common code should only be contained in a package within the [libs](./libs) directory.

As mentioned above, use of npm workspaces allows easy sharing of code across the project. Once a shared package has been added to the [libs](./libs) directory, and `npm install` has been run from the root directory (to auto-symlink the packages), it can be added as a dependency and imported as if it were any other external package.

e.g. a common package has been added with `"name": "@ukef/dtfs2-common",` in its `package.json`. This common package includes an `asString` function that we want to use in another package.

The common package would be added as a dependency in the other package with

```json
"dependencies": {
  "@ukef/dtfs2-common": "1.0.0",
  ...
}
```

and the `asString` function imported into a file with

```typescript
import { asString } from '@ukef/dtfs2-common';
```

For more details on the common library see [libs/common/README.md](/libs/common/README.md).

## Notes on workspaces flags

- `--workspaces`: this flag is added to `npm` commands so that individual scripts in each of the sub-packages included in the workspace will be run, however note that not all `npm` commands need the flag. Commands such as `npm install`, `npm ci`, and `npm audit` will run on all workspaces by default, whereas commands such as `npm test` and `npm run <script-name>` need the `--workspaces` flag added to run on all workspaces
- `--if-present`: you will notice this on a few of the scripts added in the root [package.json](./package.json). This is because when deploying individual packages to a Docker container, only the package and any shared [libs](./libs) directories will be available from the full list of workspaces in the root [package.json](./package.json)

## Notes on node_modules hoisting limitations

One of the benefits of `npm workspaces` is that common dependencies across all sub-packages will be hoisted to the root `node_modules` with only conflicting dependencies installed in the sub-package `node_modules`. This does however present some challenges. Below are some notes on challenges faced and how we've mitigated them:

Our UI packages (`portal`, `gef-ui` and `trade-finance-manager-ui`) make use of the [govuk-frontend](https://www.npmjs.com/package/govuk-frontend) and [@ministryofjustice/frontend](https://www.npmjs.com/package/@ministryofjustice/frontend) libraries for UI components and styles. When importing styles from these packages into our own Sass `.scss` files the docs advise us to import as follows:

```sass
@import "node_modules/govuk-frontend/govuk/all";
```

However, the `govuk-frontend` package has now been hoisted to the root `node_modules`, so this path is no longer correct. One way we may think to resolve this is to simply change the import path to:

```sass
@import "../node_modules/govuk-frontend/govuk/all";
```

However, this doesn't completely resolve the issue. The file we now import, itself imports other files pointing to `"node_modules/govuk-frontend/govuk/<some_other_sub_directory>"` and we have no real control over changing them.

The solution then was instead to add an alias to our webpack configuration. e.g.

```javascript
resolve: {
  alias: {
    'node_modules/govuk-frontend':path.resolve(__dirname, '../node_modules/govuk-frontend'),
    'node_modules/@ministryofjustice':path.resolve(__dirname, '../node_modules/@ministryofjustice'),
  },
},
```

so that all files, regardless if in our control or not, will be updated when the minified CSS files are created. We can now continue to use `@import "node_modules/govuk-frontend/govuk/all";` as suggested in the library docs.

Another way this could have been resolved would be to prevent hoisting of these two packages. Unfortunately though in npm workspaces the choice is to hoist all or nothing (see [install-strategy](https://docs.npmjs.com/cli/v9/commands/npm-install#install-strategy)), however in some workspaces managers there are options to prevent hoisting at a package-by-package level (e.g. see the [nohoist](https://classic.yarnpkg.com/blog/2018/02/15/nohoist/) option provided by Yarn Workspaces). Hopefully this functionality will be implemented in npm workspaces in future.
