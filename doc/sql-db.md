# SQL Database

The project uses the [Microsoft SQL Server](https://learn.microsoft.com/en-gb/sql/sql-server) RDBMS with [TypeORM](https://typeorm.io/) as the ORM.

## Why both a SQL Server and Mongo DB?

As of January 2024 the project is in the process of migrating from a MongoDB (NoSQL) database to a SQL Server (SQL) database. MongoDB collections will gradually be replaced with SQL Server tables until MongoDB can be completely removed.

## Running locally

The SQL Server database will be spun up in Docker along with all the other services (see the docker-compose step in [Setup](../README.md#setup-gear) in the main README).

### Connecting to the DB locally

Below are some example systems you can use to connect to the database locally if required:

- [SSMS](https://learn.microsoft.com/en-gb/sql/ssms) (Windows only) - dedicated SQL Server tool from Microsoft
- [DataGrip](https://www.jetbrains.com/datagrip/) (Windows, Mac, and Linux) - generic database tool from JetBrains
- [Azure Data Studio](https://learn.microsoft.com/en-us/azure-data-studio/download-azure-data-studio?tabs=win-install%2Cwin-user-install%2Credhat-install%2Cwindows-uninstall%2Credhat-uninstall) (Windows, Mac, and Linux) - a lightweight database tool from Microsoft

Use the `SQL_DB...` values in the common package [.env.sample](../libs/common/.env.sample) to connect.

### Seeding mock data

You can update the mock seeding by navigating to the `utils/sql-db-seeder/src` and making changes.

To run the seeder, see the [seeding data command](#seeding-data) below.

In order to generate data which is in line with the data in MongoDB, the SQL db seeder needs to query data inserted by the [mock data loader](../utils/mock-data-loader/).
Additionally, we need to seed tfm facilities for every facility id used by fee records inserted by the SQL db seeder (otherwise generate keying data will fail).
This results in three things which are important to remember:

1. The `mock-data-loader` script must be run _before_ the SQL seeder
2. The `create-tfm-keying-sheet-facilities` script must be run _after_ the SQL seeder.
3. The `utils/sql-db-seeder` `.env` file must include the connection strings required to initialise the [MongoDbClient](../libs/common/src/mongo-db-client/index.ts) _and_ the [SqlDbDataSource](../libs/common/src/sql-db-connection/data-source.ts) (see [.env.sample](../utils/sql-db-seeder/.env.sample))

### DB Commands

#### .env setup

The database is shared across the entire project, so commands are defined in the [common package](../libs/common) where the shared DB configuration lives.

[Configure SQL Server settings with environment variables on Linux](https://learn.microsoft.com/en-gb/sql/linux/sql-server-linux-configure-environment-variables?view=sql-server-ver16).

When running commands you can either navigate to the common package, e.g.

```shell
cd libs/common
npm run db:migrate
```

or run commands from the root directory with the workspaces flag, e.g.

```shell
npm run db:migrate -w libs/common
```

Because the commands are run from the common package, the common package needs its own set of environment variables to facilitate the connection.

In the [common package](../libs/common) copy the [.env.sample](../libs/common/.env.sample) to a new `.env` file in the same directory. For the local DB connection there shouldn't be any additional sensitive values that need to be obtained from elsewhere. Note: most values will be the same as those in the root `.env` file and used to spin up the Docker container, with the exception being `SQL_DB_HOST` which points at `localhost` as we are running from outside the docker-compose environment.

#### - Generate new migration

```shell
npm run db:generate-migration --name=<description_of_change>

# e.g. npm run db:generate-migration --name=AddUserTable
```

This command will connect to the DB and compare any defined entities in the [entity](../libs/common/src/sql-db-entity) directory to the schema of the actual DB. It will then automatically generate a file in the [migrations](../libs/common/src/sql-db-connection/migrations) directory that would resolve the differences in the database when run.

The resulting file will be prefixed with a unix timestamp of the current time so that files are listed in order of creation. e.g. for the example command above the following could be created:

```
1706102208471-AddUserTable.ts
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

Use to start the SQL Server database from scratch. This will restart the docker container, delete and recreate the database, recreate the database user which is used inside the other services and run all the migrations. In effect, this resets the database to a clean state.

#### - Removing ledger tables

```shell
npm run db:remove-ledger
```

Use to remove the ledger tables if you have them enabled. This command will restart the SQL container and recreate the database user which is used inside the other services.

#### - Seeding data

```shell
npm run db:seed
```

Use to seed data for utilisation reports into the SQL database.

## Adding DB access to a package

Though the DB configuration is contained within the [common package](../libs/common), it is up to each package that needs access to initialise a connection to the DB. This is done by adding the following to a file where the app is first initialised:

```typescript
const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');

SqlDbDataSource.initialize()
  .then(() => console.info('✅ Successfully initialised connection to SQL database'))
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
