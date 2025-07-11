# Remove SQL Ledger Tables

Following the decision to remove ledger on our SQL tables, we need a
migration to move all the existing data from the current ledger tables to
non-ledger tables. The `.sql` scripts defined in this directory perform this
operation, creating new tables with constraints which match those generated
by the migrations currently defined in [`libs/common`](../../../libs/common/src/sql-db-connection/migrations/).

## Prod and Staging

The environments have only run the first migration defined in the above
directory. The script which should be run in these cases is
[`copy-and-remove-ledger.prod.sql`](./copy-and-remove-ledger.prod.sql).

## Feature and Dev

The environments have run all the migrations defined in the above directory.
The script which should be run in these cases is
[`copy-and-remove-ledger.feature.sql`](./copy-and-remove-ledger.feature.sql).
