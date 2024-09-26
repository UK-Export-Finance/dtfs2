import { UtilisationReportDataValidationError, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { validateHeaders } from './utilisation-report-cell-validators/validate-csv-data/headers';
import { validateCells } from './utilisation-report-cell-validators/validate-csv-data/cells';
import { validateRows } from './utilisation-report-cell-validators/validate-csv-data/rows';

/**
 * Validate the utilisation report csv data
 * validates the headers
 * Generates errors for missing headers
 * Generates an array of available headers
 * Validates the cell data for each row based on the available headers
 * Validates the full csv sheet for errors - where rows with same facility ids should have certain fields matching
 * @param csvData - The data from the utilisation report csv
 * @returns An array of errors pertaining to the report if there are any
 */
export const validateUtilisationReportCsvData = async (csvData: UtilisationReportCsvRowData[]): Promise<UtilisationReportDataValidationError[]> => {
  const { missingHeaderErrors, availableHeaders } = validateHeaders(csvData[0]);

  const cellValidationErrors = await validateCells(csvData, availableHeaders);

  const rowValidationErrors = validateRows(csvData);

  const validationErrors = [...missingHeaderErrors, ...cellValidationErrors, ...rowValidationErrors];

  return validationErrors;
};
