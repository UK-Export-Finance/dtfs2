import { UtilisationReportCsvRowData, UtilisationReportDataValidationError, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateBaseCurrencyErrors } from '../../helpers/generate-base-currency-errors';
import { generateFacilityUtilisationErrors } from '../../helpers/generate-facility-utilisation-errors';

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
  let errors: UtilisationReportDataValidationError[] = [];

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

    // generate errors for base currency
    errors = generateBaseCurrencyErrors(existingData, baseCurrencyValue, errors, csvData, row);

    // generate errors for facility utilisation
    errors = generateFacilityUtilisationErrors(existingData, facilityUtilisationValue, errors, csvData, row);
  });

  return errors;
};
