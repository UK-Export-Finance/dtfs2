# The common library

The common library can be used to share code between different services,
defining it once in `libs/common` and then importing into multiple services. An
example of a function which is likely to be used across multiple services can be
seen with the helper method [`asString`](./src/helpers/validation.ts).

## Importing from the common library

The common package needs to be added as a dependency in the service which wants
to import from `libs/common` as follows

```json
"dependencies": {
  "@ukef/dtfs2-common": "1.0.0",
  ...
}
```

You can then import from this package as you would with any other package, e.g.

```js
import { asString } from '@ukef/dtfs2-common';
```

### Internal source aliases

Within the shared library, imports such as `@ukef/helpers`, `@ukef/constants`
and `@ukef/types/date` refer to directories under `libs/common/src`, not separate
npm packages. Services should continue using the public `@ukef/dtfs2-common`
exports.

The common and consuming workspace TypeScript configurations map `@ukef/*` to
the common source directory. Their `ts-node.require` settings preload
`@ukef/dtfs2-common/register-paths`, which registers the same mapping at runtime
without depending on the current working directory. This preload is also used
by the common TypeORM commands.

The Cypress task loader also preloads this mapping before compiling common
TypeScript sources with decorator metadata.

Jest configurations use `moduleNameMapper` from
[`src/module-aliases.cjs`](./src/module-aliases.cjs), including API-test
configurations that override other mappings. Browser webpack configurations use
its `webpackAliases`. These mappings preserve the public package name and its
exported subpaths. Add new top-level source directories to `sourceDirectories`
in that file when they need browser aliases.

New consuming workspaces must configure both TypeScript paths and the runtime
preload, plus the Jest mapper and webpack aliases when applicable. A TypeScript
path mapping alone does not rewrite imports or make them resolvable at runtime.

### Common importing issues

#### `tsconfig.json`

The [TypeORM](https://typeorm.io/) [entities](./src/sql-db-entities/index.ts)
defined in `libs/common` use typescript decorators to define columns. As these
are included in the main `@ukef/dtfs2-common` export, the service which wants
to use the common library needs to modify its `tsconfig.json` file to include
the following options:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    ...
  }
}
```

## Exporting from the common library

Most code should be exported up the tree and exported from
[`src/index.ts`](./src/index.ts). Any code exported this way will be available
to import from `'@ukef/dtfs2-common'`.

When a service first imports from the main `'@ukef/dtfs2-common'` entrypoint,
the `src/index.ts` file is executed. Subsequent imports in other files within
the service will then not need to execute the file again.

We have isolated some exports from `libs/common`, such as
[`SqlDbDataSource`](./src/sql-db-connection/data-source.ts). The reason to do
this is that certain exports have specific dependency and/or environment
variable requirements which may not be shared by the service which is importing
from `@ukef/dtfs2-common`. For example, the `SqlDbDataSource` uses runtime
validation to ensure that the required environment variables are present when
the `DataSource` instance is created. Any service which does not have these
environment variables would therefore fail to start despite the fact that they
never explicitly import the `SqlDbDataSource` instance.

To define a new custom export path, navigate to the [`package.json`](./package.json)
and add a new line to `exports` with the export name and file path, e.g.

```json
"exports": {
    "./sql-db-connection": "./src/sql-db-connection/index.ts"
}
```

The import for this custom export then would become

```js
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
```

It's important to be aware when you are writing code with specific dependency
and/or environment variable in the common library and consider whether it
should be exported by the main export path, one of the other existing exports,
a new export, or sometimes perhaps not live in the common library at all.
