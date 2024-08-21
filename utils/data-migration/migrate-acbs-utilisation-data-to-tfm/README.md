# ACBS Utilisation Data Migration to TFM

This script migrates ACBS facility utilisation data to TFM by reading from a JSON file and inserting the data into the SQL database.

## JSON Input File Structure

The script expects a JSON file with the following structure:
```ts
[
  {
    "facilityId": "string",
    "utilisation": number,
    "fixedFeePremium": number
  },
  ...
]
```

## Configuring the Script

### Report Period

To modify the report period, update the `REPORT_PERIOD` constant at the top of the `index.ts` file with appropriate values.

### JSON File Path

To change the location of the input JSON file, modify the `JSON_FILE_PATH` constant at the top of the `index.ts` file.

## Running the Script

Follow these steps to run the migration script:

1. Update the report period constant at the top of `index.ts` if necessary.
2. Prepare your JSON input file with the required structure.
3. Update the JSON input file path constant (`JSON_FILE_PATH`) with the correct path.
4. Run the script from the `utils` directory using the script command:

    `npm run migrate-acbs-utilisation-data-to-tfm`

5. Check the console output for any error messages or successful completion of the migration.
