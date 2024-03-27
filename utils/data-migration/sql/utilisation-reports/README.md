# Utilisation Reports MongoDB --> SQL Server Migrator

Helper function used to migrate utilisation reports from MongoDB to SQL Server

- Takes raw MongoDB [EJSON](https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/) data for the `utilisationReports` and `utilisationData` collections
- Converts to the required TypeORM SQL entities
- Saves the converted data to the configured SQL database

## Setup

1. **Export the MongoDB EJSON data** - connect to the required MongoDB database with Compass, then for each of `utilisationReports` and `utilisationData`:

   - highlight the collection, click "More Options" on the RHS, then "EXPORT COLLECTION"
   - choose "Export Full Collection" then "Select Fields"
   - leave all fields selected then "Select Output"
   - choose "Export File Type" as "JSON", set an "Output", then "Export"

2. **Add the EJSON data to the migrator** - copy the data from the exported files and add to the respective `.json` files in the [mongodb-ejson](./mongodb-ejson) directory

3. **Configure the SQL Server connection** - add a `.env` file in the root of the [utils/data-migration](../..) directory with the following values, populated according to connection details for the SQL Server database you are migrating to:

```yaml
# SQL DB CONNECTION
SQL_DB_HOST=
SQL_DB_PORT=
SQL_DB_USERNAME=
SQL_DB_PASSWORD=
SQL_DB_NAME=
SQL_DB_LOGGING_ENABLED=true
```

4. **Run the migrator** - from the [utils/data-migration](../..) directory run

```shell
npm run mongo-sql-migrator:utilisation-reports
```
