# The common library

The common library can be used to share code between different services, by defining it once in `libs/common` and then importing into multiple services.

An example of such can be seen with the helper method `asString`:

The common package would be added as a dependency in the other package wanting to use the `asString` helper method with:

```json
"dependencies": {
  "@ukef/dtfs2-common": "1.0.0",
  ...
}
```

and the `asString` function imported into a file with:

```js
import { asString } from '@ukef/dtfs2-common';
```

## Exporting from the common library

Most code should be exported up the tree and exported from `src/index.ts`. Any code exported this way will be available to import from `'@ukef/dtfs2-common'`.

When a service first imports from the main `'@ukef/dtfs2-common'` entrypoint, the `src/index.ts` file is executed.
Subsequent imports in other files within the service will then not need to execute the file again.

We have isolated some folders as separate export paths, since they contain code with side effects, that should only execute when code from those specific folders is imported.

e.g., to import the `SqlDbDataSource` you have to import it from the `'@ukef/dtfs2-common/sql-db-connection'` entrypoint. e.g.

```js
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
```

This is because when the file this is exported from is executed, it reads some env vars into memory and creates a database connection.
(It is written this way rather than an exported function which creates a new connection so that a single data source is used across any service importing it.)
If this was exported through the main entry-point, then this file would execute in every service using the common library, even if the service should not be able to connect to the database itself directly and doesn't attempt to make use of the exported datasource.
If it didn't have a reference to the env vars required, this would cause errors.
And we don't want a service to have access to sql env vars it doesn't need and connect to the database when it shouldn't have that access.


Hence this code has been isolated into it's own entry point and should only be imported into services than can and should be connecting to the SQL database.

It's important to be aware when you are writing code with side-effects in the common library and consider whether it should be exported by the main export path, one of the other existing exports, a new export, or sometimes perhaps not live in the common library at all.
