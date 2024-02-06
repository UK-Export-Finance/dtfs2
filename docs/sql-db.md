# SQL Database

The project uses the [Microsoft SQL Server](https://learn.microsoft.com/en-gb/sql/sql-server) RDBMS with [TypeORM](https://typeorm.io/) as the ORM.

## Why both a SQL Server and Mongo DB?

As of January 2024 the project is in the process of migrating from a MongoDB (NoSQL) database to a SQL Server (SQL) database. MongoDB collections will gradually be replaced with SQL Server tables until MondoDB can be completely removed.

## Running locally

The SQL Server database will be spun up in Docker along with all the other services (see the docker-compose step in [Setup](../README.md#setup-gear) in the main README).

### Connecting to the DB locally

Below are some example systems you can use to connect to the database locally if required:

- [SSMS](https://learn.microsoft.com/en-gb/sql/ssms) (Windows only) - dedicated SQL Server tool from Microsoft
- [DataGrip](https://www.jetbrains.com/datagrip/) (Windows, Mac, and Linux) - generic database tool from JetBrains

Use the `SQL_DB...` values in the common package [.env.sample](../libs/common/.env.sample) to connect.

### DB Commands

#### .env setup

The database is shared across the entire project, so commands are run from the [common package](../libs/common) where the shared DB configuration lives. For this reason the common package needs its own set of environment variables to facilitate the connection

Copy the [.env.sample](../libs/common/.env.sample) to a new `.env` file. For the local DB connection there shouldn't be any additional sensitive values that need to be obtained from elsewhere. Note: most values will be the same as those in the root `.env` file and used to spin up the Docker container, with the exception being `SQL_DB_HOST` which points at `localhost` as we are running from outside the docker-compose environment.

#### - Generate new migration

```shell
npm run db:generate-migration --name=<description_of_change>

# e.g. npm run db:generate-migration --name=AddUserTable
```

This command will connect to the DB and compare any defined entities in the [entity](../libs/common/src/sql-db-entity) directory to the schema of the actual DB. It will then automatically generate a file in the [migrations](../libs/common/src/sql-db-connection/migrations) directory that would resolve the differences in the database when run.

The resulting file will be prefixed with a unix timestamp of the current time so that files are listed in order of creation. e.g. for the example command above the following could be created:

```
1706102208471-add-users-table.ts
```

This time stamp and order is important because it determines the order in which the migrations are run (see [Run migrations](#--run-migrations) below).

In the new file there will be two functions:

- `up`: how to apply the new changes
- `down`: how to revert the changes

⚠️ Always check the contents of the auto-generated migrations for correctness. In some situations we will always need to manually adjust them (e.g. if a new non-nullable column is added we will need to specify how to populate any existing rows)

#### - Run migrations

```shell
npm run db:migrate
```

TypeORM automatically tracks which migrations have already been run in a `migrations` table in the database.

⚠️ When running this command, it **WON'T** just apply any that have not already been run, but instead find the last one run in the `migrations` table and run any ordered after that one. For this reason we must take care to ensure that any new migrations are added in the correct order when merging git branches.

#### - Reverting migrations

```shell
npm run db:migrate:down
```

Note: this only reverts the latest executed migration. If you need to revert multiple migrations you must call this command multiple times.

#### - Rebuild the database

```shell
npm run db:reset
```

Use as a quick way to start from scratch instead of deleting and re-building the docker container. This will drop all tables then run all migrations to get back to a clean state.

## Adding DB access to a package

Though the DB configuration is contained within the [common package](../libs/common), it is up to each package that needs access to initialise a connection to the DB. This is done by adding the following to a file where the app is first initialised:

```typescript
const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');

SqlDbDataSource.initialize()
  .then(() => console.info('🗄️ Successfully initialised connection to SQL database'))
  .catch((error) => console.error('❌ Failed to initialise connection to SQL database:', error));
```

e.g. in the [dtfs-central-api](../dtfs-central-api) project this has been added to [generateApp.js](../dtfs-central-api/src/generateApp.js).

The package will then need to be given access to the following environment variables:

```
SQL_DB_HOST
SQL_DB_PORT
SQL_DB_USERNAME
SQL_DB_PASSWORD
SQL_DB_NAME
SQL_DB_LOGGING_ENABLED
```

Note: in contrast to other common functionality which is imported from `'@ukef/dtfs2-common'`, the `SqlDbDataSource` is imported from a separate `'@ukef/dtfs2-common/sql-db-connection'` sub-directory. This means that only those packages that need to connect to the DB and import from this sub-directory will need to be provided with access to the required environment variables.

[//]: # 'TODO FN-1859 - add details on how to use repos with `extend` and use of Data Mapper pattern'
