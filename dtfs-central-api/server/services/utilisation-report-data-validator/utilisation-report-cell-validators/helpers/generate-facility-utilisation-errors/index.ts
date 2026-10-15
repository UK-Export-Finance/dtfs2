import { UtilisationReportCsvRowData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { hasMismatch } from '../has-mismatch';
import { addErrorOnEveryRow } from '../add-error-on-every-row';

/**
 * generates errors for facility utilisation
 * if the value for facility utilisation in the map does not match the value in the row
 * then call generateErrorsForMismatchedFacilityValues to generate an error for all rows of the same facility id
 * @param {UtilisationReportCsvRowData[]} rows - rows to generate errors for
 * @param {UtilisationReportCsvRowData[]} completeRows - all csv data
 * @returns {UtilisationReportDataValidationError[]} generated errors
 */
export const generateFacilityUtilisationErrors = (
  rows: UtilisationReportCsvRowData[],
  completeRows: UtilisationReportCsvRowData[],
): UtilisationReportDataValidationError[] => {
  const field = 'facility utilisation';
  const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';

  if (!hasMismatch(completeRows, field)) {
    return [];
  }

  return addErrorOnEveryRow(rows, field, errorMessage);
};
