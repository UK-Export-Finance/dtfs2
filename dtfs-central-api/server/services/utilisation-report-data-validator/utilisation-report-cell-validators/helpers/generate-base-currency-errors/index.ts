import { UtilisationReportCsvRowData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { addErrorOnEveryRow } from '../add-error-on-every-row';
import { hasMismatch } from '../has-mismatch';

/**
 * generates errors for base currency
 * if the value for base currency in the map does not match the value in the row
 * then call addErrorOnEveryRow to generate an error for all rows of the same facility id
 * @param rows - rows to generate errors for
 * @param completeRows - all csv data for the facility
 * @returns generated errors
 */
export const generateBaseCurrencyErrors = (
  rows: UtilisationReportCsvRowData[],
  completeRows: UtilisationReportCsvRowData[],
): UtilisationReportDataValidationError[] => {
  const field = 'base currency';
  const errorMessage = 'The currency does not match the other records for this facility. Enter the correct currency.';

  if (!hasMismatch(completeRows, field)) {
    return [];
  }

  return addErrorOnEveryRow(rows, field, errorMessage);
};
