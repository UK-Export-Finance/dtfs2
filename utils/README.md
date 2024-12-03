# Utilities :wrench:

This section contains utility scripts and data for various purposes.

## Data Migration :arrows_counterclockwise:

The `data-migration` directory contains scripts designed to facilitate the
migration of data from Portal V1 to Portal V2. For detailed instructions and
usage, please refer to the [data-migration/README.md](data-migration/README.md) file.

## Data seeding

The project uses two different databases, a Mongo db and an MSSQL Server db. It is useful to seed these with data for running locally to speed up development, and we also run some seeding before running e2e-tests to make testing possible.

Running `npm run load` will run `mock-data-loader`, `sql-db-seeder` and then finally `create-keying-sheet-tfm-facilities` scripts one after another.

:warning: Please note you will need to run the MSSQL db migrations before running the MSSQL seeding, and therefore also before `npm run load` (since it is one of the steps) if you haven't run them previously (or recently if there are new migrations).

### Mock Data Loader :page_with_curl:

The `mock-data-loader` directory contains mock data that can be used for local
development and in non-production environments.

This script is also used in various e2e-tests to set up users
and banks that can be used for testing.

The script doesn't create any facilities, and wipes all
existing mongo data, so if you want to reset your database
without any facilities, then you can run this command directly
(i.e. not as part of `npm run load` which will create facilities).

Use the following NPM script from the project root
to perform following operations:

You can run mock data loader directly using

- Clearing all the collections.
- Insert mock data to the following collections:
  - Portal
  - TFM
  - Users (both TFM and Portal)
  - Banks
  - Mandatory criteria
  - Eligibility criteria

```shell
npm run load
```

## SQL DB Seeder

The `sql-db-seeder` directory contains a script which seeds random data
into the MSSQL database for utilisation reports.

You can run the following command to initiate MSSQL seeder directly

```shell
npm run db:seed
```

If you wish to intiate a mock data loader for both Mongo and MSSQL, one can call
the following script from `utils` directory.

```shell
npm run load:sql
```

command.

Please make sure your `SQL_DB_HOST` env var in the `utils` folder is correct for where you are running the command.
If you are running the command from outside the docker container locally this will need to be `localhost`, but if you are running from inside the docker container then it should be `dtfs-sql`.

This script will delete all current data in the SQL db, replacing it with fresh data.

If you wish to wipe all data from the SQL database and not replace it,please see the `npm run db:reset` command which can be run from `libs/common` which is explained in more detail in [the SQL db documentation](../doc/sql-db.md).

### Create Keying Sheet TFM Facilities

The `create-keying-sheet-tfm-facilities` directory contains a script which inserts data into the Mongo DB database to line up with the data inserted by the `sql-db-seeder`. This is needed as the "keying sheet" related functionality requires that the `FeeRecord` facility ids which are inserted correspond the UKEF facility ids in the Mongo DB `facilities` and `tfm-facilities` colletion.

You can run this script directly using

```shell
npm run create-keying-sheet-tfm-facilities
```

or indirectly via both

```shell
npm run db:seed
```

or

```shell
npm run load
```

## Validate Facility IDs

The `validate-facility-ids` directory contains a script which checks and compares the UKEF facility ids in the SQL `FeeRecord` table and the Mongo DB `tfm-facilities` collection to ensure that each entry in one database lines up with an entry in the other.

You can run this script using

```shell
npm run validate-facility-ids
```

In order to run this script against a specific environment, you need to update the following environment variables to the relevant values.

```sh
# Mongo DB
MONGO_INITDB_DATABASE=
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGODB_URI=

# SQL
SQL_DB_HOST=
SQL_DB_PORT=
SQL_DB_USERNAME=
SQL_DB_PASSWORD=
SQL_DB_NAME=
```

---
