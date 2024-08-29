# Utilities :wrench:

This section contains utility scripts and data for various purposes.

## Data Migration :arrows_counterclockwise:

The `data-migration` directory contains scripts designed to facilitate the
migration of data from Portal V1 to Portal V2. For detailed instructions and
usage, please refer to the [data-migration/README.md](data-migration/README.md) file.

## Mock Data Loader :page_with_curl:

The `mock-data-loader` directory contains mock data that can be used for local
development and in non-production environments.

Use the following NPM script from the project root
to perform following operations:

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

The `sql-db-seeder` directory contains a script which seeds random data into the
SQL database for utilisation reports.

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

## Create Keying Sheet TFM Facilities

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
MONGODB_URI_QA=

# SQL
SQL_DB_HOST=
SQL_DB_PORT=
SQL_DB_USERNAME=
SQL_DB_PASSWORD=
SQL_DB_NAME=
```

---
