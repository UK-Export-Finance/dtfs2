import { UtilisationReportCsvRowData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { generateBaseCurrencyErrors } from '../../helpers/generate-base-currency-errors';
import { generateFacilityUtilisationErrors } from '../../helpers/generate-facility-utilisation-errors';

/**
 * validateRows
 * Generate and returns validation errors for each facility in csv rows
 * if multiple facilities have the same ukef facility ids,
 * and the "base currency" and "facility utilisation" values do not match
 * generate validation errors for each facility
 * @param {UtilisationReportCsvRowData[]} csvData - The csv data
 * @returns {UtilisationReportDataValidationError[]} Generated errors
 */
export const validateRows = (csvData: UtilisationReportCsvRowData[]): UtilisationReportDataValidationError[] => {
  // Map to store each facility id and all of its rows
  const map = new Map<string, UtilisationReportCsvRowData[]>();
  const errors: UtilisationReportDataValidationError[] = [];

  // Groups the rows by facility id and stores them in the map
  csvData.forEach((row) => {
    const ukefFacilityId = row['ukef facility id']?.value;

    if (!ukefFacilityId) {
      return;
    }

    // If the facility id is not already in the map, add it with an empty array
    if (!map.has(ukefFacilityId)) {
      map.set(ukefFacilityId, []);
    }

    // Add the row to the array for the facility id in the map
    map.get(ukefFacilityId)?.push(row);
  });

  // Checks each group of rows for mismatches in "base currency" and "facility utilisation"
  map.forEach((rows) => {
    // only compare rows which have both values (missing values are handled elsewhere)
    const completeRows = rows.filter((row) => row['base currency']?.value && row['facility utilisation']?.value);

    errors.push(...generateBaseCurrencyErrors(rows, completeRows));
    errors.push(...generateFacilityUtilisationErrors(rows, completeRows));
  });

  return errors;
};
