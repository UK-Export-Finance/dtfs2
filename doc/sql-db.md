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

Use the `SQL_DB...` values in the common package [.env.sample](../libs/common/.env.sample) to connect.

### Seeding mock data

To add a new seed to the project, navigate to the `utils/sql-db-seeder/src` directory and create a directory for the entity you wish to create a seeder for. Seeds are defined as files which have the `.seed.ts` extension, whilst factories are defined using the `.factory.ts` extension (see the [seeder data source](../utils/sql-db-seeder/src/seeding-data-source.ts) `seederOptions` parameter). Note: a factory is not required, but can be useful if you want to create many rows with randomised data.

To run the seeder, see the [seeding data command](#seeding-data) below.

In order to generate data which is in line with the data in MongoDB, the SQL seeder needs to query data inserted by the [mock data loader](../utils/mock-data-loader/). This results in two things which are important to remember:

1. Mock data loader must be run _before_ the SQL seeder
2. The `utils/sql-db-seeder` `.env` file must include the connection strings required to initialise the [MongoDbClient](../libs/common/src/mongo-db-client/index.ts) _and_ the [SqlDbDataSource](../libs/common/src/sql-db-connection/data-source.ts) (see [.env.sample](../utils/sql-db-seeder/.env.sample))

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

Use as a quick way to start from scratch instead of deleting and re-building the docker container. This will drop all tables then run all migrations to get back to a clean state.

#### - Seeding data

The seeder can be run from either the project root or the `utils` directory via the

```shell
npm run db:seed
```

command. This command first runs the `predb:seed` script (see details below) and then runs the seeder to insert mock data into the SQL database. Seeds and factories are defined as files in the `utils/sql-db-seeder/src/<name-of-entity>` directory with `<name-of-entity>.seed.ts` and `<name-of-entity>.factory.ts` file extensions respectively (see the [utilisation reports seeder](../libs/common/src/sql-db-seeder/utilisation-report/) for an example). Seed tracking is set to `true` by default such that, once a seed successfully runs, it will not run again through the `npm run db:seed` command. If you want to run the seeder again, you will first need to run the `npm run db:reset` command from `libs/common`.

As a result of not building the project, the `typeorm-extension` executable needs to be run directly from the `node_modules` via `ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:run`. The `node_modules` directory where `typeorm-extension` is located needs to be at the same level as the root of the seeder which, in this case, is `utils/sql-db-seeder`. Due to conflicting versions of `mongodb`, the `typeorm-extension` package actually gets placed within the root level `node_modules` after running `npm i`. To overcome this issue, the `predb:seed` script copies the required node modules to `utils/sql-db-seeder` before executing the `db:seed` script.

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
