import { UtilisationReportCsvRowData, UtilisationReportDataValidationError, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateErrorsForMismatchedFacilityValues } from '../../helpers/generate-errors-for-mismatched-facility-values';

/**
 * validateRows
 * Generate and returns validation errors for each facility in csv rows
 * if multiple facilities have the same ukef facility ids,
 * and the "base currency" and "facility utilisation" values do not match
 * generate validation errors for each facility
 * Uses a map to store the facility ids and their base currency and facility utilisation values to match against
 * @param {UtilisationReportCsvRowData[]} csvData - The csv data
 * @returns {UtilisationReportDataValidationError[]} Generated errors, null if the data is valid
 */
export const validateRows = (csvData: UtilisationReportCsvRowData[]): UtilisationReportDataValidationError[] => {
  // Map to store the facility ids and their base currency and facility utilisation values
  const map = new Map<string, UtilisationReportFacilityData>();
  const errors: UtilisationReportDataValidationError[] = [];

  /**
   * iterates through each row of the csv
   * get value for the ukef facility id, base currency and facility utilisation and exporter name
   * if the base currency or facility utilisation is missing, go to the next row (these errors handled)
   * if the facility id is already in the map, check if the base currency and facility utilisation match
   * else add the facility id and its base currency and facility utilisation to the map
   */
  csvData.forEach((row) => {
    const ukefFacilityId = row['ukef facility id']?.value;
    const baseCurrencyValue = row['base currency']?.value;
    const facilityUtilisationValue = row['facility utilisation']?.value;
    const exporterName = row['bank facility reference']?.value;

    if (!baseCurrencyValue || !facilityUtilisationValue || !ukefFacilityId || !exporterName) {
      return;
    }

    if (!map.has(ukefFacilityId)) {
      map.set(ukefFacilityId, {
        baseCurrency: baseCurrencyValue,
        facilityUtilisation: facilityUtilisationValue,
      });

      return;
    }

    const existingData = map.get(ukefFacilityId);

    /**
     * if the value for base currency in the map does not match the value in the row
     * call to addMatchingRowErrors to generate an error for all rows of the same facility id
     */
    if (existingData?.baseCurrency !== baseCurrencyValue) {
      const errorMessage = 'The currency does not match the other records for this facility. Enter the correct currency.';
      const field = 'base currency';

      const generatedErrors = generateErrorsForMismatchedFacilityValues(csvData, errors, row, field, errorMessage, exporterName);

      errors.push(...generatedErrors);
    }

    /**
     * if the value for facility utilisation in the map does not match the value in the row
     * call to addMatchingRowErrors to generate an error for all rows of the same facility id
     */
    if (existingData?.facilityUtilisation !== facilityUtilisationValue) {
      const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';
      const field = 'facility utilisation';

      const generatedErrors = generateErrorsForMismatchedFacilityValues(csvData, errors, row, field, errorMessage, exporterName);

      errors.push(...generatedErrors);
    }
  });

  return errors;
};
