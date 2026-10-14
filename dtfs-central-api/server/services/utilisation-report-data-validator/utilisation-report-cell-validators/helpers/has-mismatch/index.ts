import { UtilisationReportCsvRowData } from '@ukef/dtfs2-common';

/**
 * Checks if there is a mismatch in the values of a field for a set of rows
 * maps through the rows and creates a set of the values for the field
 * if the size of the set is greater than 1, there is a mismatch
 * @param {UtilisationReportCsvRowData[]} rows - The rows to check
 * @param {string} field - The field to check for mismatches
 * @returns {boolean} True if there is a mismatch, false otherwise
 */
export const hasMismatch = (rows: UtilisationReportCsvRowData[], field: string): boolean => new Set(rows.map((row) => row[field]?.value)).size > 1;
