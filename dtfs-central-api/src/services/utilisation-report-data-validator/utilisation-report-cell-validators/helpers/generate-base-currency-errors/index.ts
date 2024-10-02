import { UtilisationReportCsvRowData, UtilisationReportDataValidationError, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateErrorsForMismatchedFacilityValues } from '../generate-errors-for-mismatched-facility-values';

/**
 * generates errors for base currency
 * if the value for base currency in the map does not match the value in the row
 * then call generateErrorsForMismatchedFacilityValues to generate an error for all rows of the same facility id
 * @param existingData - data in the map
 * @param baseCurrencyValue - provided value for base currency
 * @param errors - existing validation errors
 * @param csvData - all csv data
 * @param row - current row to generate errors from
 * @returns generated errors
 */
export const generateBaseCurrencyErrors = (
  existingData: UtilisationReportFacilityData | undefined,
  baseCurrencyValue: string,
  errors: UtilisationReportDataValidationError[],
  csvData: UtilisationReportCsvRowData[],
  row: UtilisationReportCsvRowData,
): UtilisationReportDataValidationError[] => {
  /**
   * if the value for base currency in the map does not match the value in the row
   * call to addMatchingRowErrors to generate an error for all rows of the same facility id
   */
  if (existingData?.baseCurrency !== baseCurrencyValue) {
    const errorMessage = 'The currency does not match the other records for this facility. Enter the correct currency.';
    const field = 'base currency';

    const generatedErrors = generateErrorsForMismatchedFacilityValues(csvData, errors, row, field, errorMessage);

    errors.push(...generatedErrors);
  }

  return errors;
};
