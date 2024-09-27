import { UtilisationReportCsvRowData, UtilisationReportDataValidationError, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateErrorsForMismatchedFacilityValues } from '../generate-errors-for-mismatched-facility-values';

export const generateBaseCurrencyErrors = (
  baseCurrencyValue: string,
  errors: UtilisationReportDataValidationError[],
  csvData: UtilisationReportCsvRowData[],
  row: UtilisationReportCsvRowData,
  exporterName: string,
  existingData?: UtilisationReportFacilityData,
) => {
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

  return errors;
};
