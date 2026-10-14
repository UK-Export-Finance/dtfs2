import { UtilisationReportCsvRowData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';

/**
 * Adds an error for the field on every row
 * @param {UtilisationReportCsvRowData[]} rows - The rows to add errors for
 * @param {string} field - The field to add errors for
 * @param {string} errorMessage - The error message to add
 * @returns {UtilisationReportDataValidationError[]} generated errors
 */
export const addErrorOnEveryRow = (rows: UtilisationReportCsvRowData[], field: string, errorMessage: string): UtilisationReportDataValidationError[] =>
  rows.map(
    (row) =>
      ({
        errorMessage,
        column: row[field]?.column,
        row: row[field]?.row,
        value: row[field]?.value,
        exporter: row.exporter?.value,
      }) as UtilisationReportDataValidationError,
  );
