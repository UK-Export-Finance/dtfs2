import { UtilisationReportCsvRowData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import _ from 'lodash';

/**
 * Adds error message for all matching facility id rows
 * Finds all rows with the same facility id
 * Generates errors if errors do not already exist in the provided errors object t
 * @param {UtilisationReportCsvRowData[]} csvData
 * @param {UtilisationReportDataValidationError[]} errors - existing validation errors
 * @param {UtilisationReportCsvRowData} csvRow - current CSV row to generate errors from
 * @param {string} field - field to obtain values
 * @param {string} errorMessage - error message to generate
 * @returns {UtilisationReportDataValidationError[]} generated errors
 */
export const generateErrorsForMismatchedFacilityValues = (
  csvData: UtilisationReportCsvRowData[],
  errors: UtilisationReportDataValidationError[],
  csvRow: UtilisationReportCsvRowData,
  field: string,
  errorMessage: string,
): UtilisationReportDataValidationError[] => {
  // find all rows with matching facility id
  const matchingRows = csvData.filter((row: UtilisationReportCsvRowData) => row['ukef facility id']?.value === csvRow['ukef facility id']?.value);
  const newErrors: UtilisationReportDataValidationError[] = [];

  /**
   * iterate through rows with same facility id
   * generate error message from row and provided error message
   * check if row contains identical error
   * if the error is unique, push the error to the errors array
   */
  matchingRows.forEach((row: UtilisationReportCsvRowData) => {
    const errorObject = {
      errorMessage,
      column: row[field]?.column,
      row: row[field]?.row,
      value: row[field]?.value,
      exporter: row.exporter?.value,
    } as UtilisationReportDataValidationError;

    const isNotInErrors = !errors.some((error) => _.isEqual(error, errorObject));

    if (isNotInErrors) {
      newErrors.push(errorObject);
    }
  });

  return newErrors;
};
