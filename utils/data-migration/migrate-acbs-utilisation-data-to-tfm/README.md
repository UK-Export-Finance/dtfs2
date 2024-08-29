# Migrate ACBS Utilisation Data to TFM

This script migrates ACBS facility utilisation data to TFM by reading from a
JSON file and inserting the data into the SQL database.

## JSON Input File Structure

The script expects a JSON file containing an array of objects with the structure:

```json
{
  "facilityId": "string",
  "utilisation": 100000,
  "fixedFeePremium": 1000
}
```

An example file follows:

```json
[
  {
    "facilityId": "123",
    "utilisation": 100000,
    "fixedFeePremium": 1000
  },
  {
    "facilityId": "456",
    "utilisation": 200000,
    "fixedFeePremium": 2000
  }
]
```

## Required Environment Variables

To run the script, ensure the following environment variables are set to
relevant values in the `.env` file located in the `utils` directory:

```sh
SQL_DB_HOST=
SQL_DB_PORT=
SQL_DB_USERNAME=
SQL_DB_PASSWORD=
SQL_DB_NAME=
SQL_DB_LOGGING_ENABLED=true
```

## Configuring the Script

### Report Period

To modify the report period, update the `REPORT_PERIOD` constant at the top of
the `index.ts` file with appropriate values.

### JSON File Path

To change the location of the input JSON file, modify the `JSON_FILE_PATH`
constant at the top of the `index.ts` file.

## Running the Script

Follow these steps to run the migration script:

1. Ensure the required environment variables are set in the `utils/.env` file.
   See the
   ["Required Environment Variables" section](#required-environment-variables)
   for details.
2. Update the report period constant at the top of `index.ts` if necessary.
3. Prepare your JSON input file with the required structure. See the
   ["JSON Input File Structure" section](#json-input-file-structure) for details.
4. Update the JSON input file path constant (`JSON_FILE_PATH`) with the
   correct path.
5. Run the script from the `utils` directory using the script command:

   `npm run migrate-acbs-utilisation-data-to-tfm`

6. Check the console output for any error messages or successful completion of
   the migration.
