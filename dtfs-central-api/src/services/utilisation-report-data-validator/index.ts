import { UtilisationReportDataValidationError, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import validateUtilisationReportCsvHeaders from './utilisation-report-cell-validators/helpers/validate-csv-headers';
import validateUtilisationReportCsvCellData from './utilisation-report-cell-validators/helpers/validate-csv-cell-data';
import validateUtilisationReportCells from './utilisation-report-cell-validators/helpers/validate-csv-cells';

/**
 * Validate the utilisation report csv data
 * validates the headers first to generate errors for headers and also the headers which are available
 * Validates the cell data for each row based on the available headers
 * Validates the full csv sheet for errors - where rows with same facility ids should have certain fields matching
 * @param csvData - The data from the utilisation report csv
 * @returns An array of errors pertaining to the report if there are any
 */
export const validateUtilisationReportCsvData = async (csvData: UtilisationReportCsvRowData[]): Promise<UtilisationReportDataValidationError[]> => {
  const { missingHeaderErrors, availableHeaders } = validateUtilisationReportCsvHeaders(csvData[0]);

  let dataValidationErrors = await validateUtilisationReportCsvCellData(csvData, availableHeaders);

  dataValidationErrors = validateUtilisationReportCells(csvData, dataValidationErrors);

  const validationErrors = missingHeaderErrors.concat(dataValidationErrors);

  return validationErrors;
};
