import { UtilisationReportCsvRowData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';

interface FacilityData {
  baseCurrency: string;
  facilityUtilisation: string;
}

/**
 * validateRows
 * Generate and returns validation errors for the facility utilisation csv rows
 * if facilities have the same ukef facility ids, then the base currency and facility utilisation values should match
 * if not, generate validation errors
 * Uses a map to store the facility ids and their base currency and facility utilisation values to match against
 * @param {UtilisationReportCsvRowData[]} csvData - The csv data
 * @param {UtilisationReportDataValidationError[]} validationErrors - Existing validation errors
 * @returns {UtilisationReportDataValidationError[]} The error if data is invalid, null if the data is valid
 */
const validateRows = (csvData: UtilisationReportCsvRowData[], validationErrors: UtilisationReportDataValidationError[]) => {
  // Map to store the facility ids and their base currency and facility utilisation values
  const map = new Map<string, FacilityData>();
  const errors: UtilisationReportDataValidationError[] = [];

  /**
   * maps through each row of the csv
   * get value for the ukef facility id, base currency and facility utilisation and exporter name
   * if the base currency or facility utilisation is missing, go to the next row (these errors handled)
   * if the facility id is already in the map, check if the base currency and facility utilisation match
   * else add the facility id and its base currency and facility utilisation to the map
   */
  csvData.forEach((row) => {
    const ukefFacilityId = row['ukef facility id'].value;
    const baseCurrencyValue = row['base currency']?.value;
    const facilityUtilisationValue = row['facility utilisation']?.value;
    const exporterName = row['bank facility reference']?.value;

    if (!baseCurrencyValue || !facilityUtilisationValue || !ukefFacilityId) {
      return;
    }

    if (map.has(ukefFacilityId)) {
      const existingData = map.get(ukefFacilityId);

      /**
       * if the value for base currency in the map does not match the value in the row
       * push to the error array
       */
      if (existingData?.baseCurrency !== baseCurrencyValue) {
        errors.push({
          errorMessage: `The currency does not match the other records for this facility. Enter the correct currency.`,
          column: row['base currency']?.column,
          row: row['base currency']?.row,
          value: baseCurrencyValue,
          exporter: exporterName,
        });
      }
      /**
       * if the value for facility utilisation in the map does not match the value in the row
       * push to the error array
       */
      if (existingData?.facilityUtilisation !== facilityUtilisationValue) {
        errors.push({
          errorMessage: `The utilisation does not match the other records for this facility. Enter the correct utilisation.`,
          column: row['facility utilisation']?.column,
          row: row['facility utilisation']?.row,
          value: facilityUtilisationValue,
          exporter: exporterName,
        });
      }
    } else {
      map.set(ukefFacilityId, {
        baseCurrency: baseCurrencyValue,
        facilityUtilisation: facilityUtilisationValue,
      });
    }
  });

  // if there are errors, push to the validation errors array
  if (errors.length) {
    validationErrors.push(...errors);
  }

  return validationErrors;
};

export default validateRows;
