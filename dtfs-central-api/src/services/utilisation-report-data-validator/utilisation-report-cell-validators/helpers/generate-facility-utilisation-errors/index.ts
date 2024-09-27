import { UtilisationReportCsvRowData, UtilisationReportDataValidationError, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateErrorsForMismatchedFacilityValues } from '../generate-errors-for-mismatched-facility-values';

/**
 * generateFacilityUtilisationErrors
 * generates errors for facility utilisation
 * if the value for facility utilisation in the map does not match the value in the row
 * then call generateErrorsForMismatchedFacilityValues to generate an error for all rows of the same facility id
 * @param {UtilisationReportFacilityData | undefined} mapData - data in the map
 * @param {String} facilityUtilisationValue - provided value for facility utilisation
 * @param {UtilisationReportDataValidationError[]} errors - existing validation errors
 * @param {UtilisationReportCsvRowData[]} csvData - all csv data
 * @param {UtilisationReportCsvRowData} row - current row to generate errors from
 * @param {String} exporterName
 * @returns {UtilisationReportDataValidationError[]} generated errors
 */
export const generateFacilityUtilisationErrors = (
  facilityUtilisationValue: string,
  errors: UtilisationReportDataValidationError[],
  csvData: UtilisationReportCsvRowData[],
  row: UtilisationReportCsvRowData,
  exporterName: string,
  mapData?: UtilisationReportFacilityData,
) => {
  /**
   * if the value for facility utilisation in the map does not match the value in the row
   * call to addMatchingRowErrors to generate an error for all rows of the same facility id
   */
  if (mapData?.facilityUtilisation !== facilityUtilisationValue) {
    const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';
    const field = 'facility utilisation';

    const generatedErrors = generateErrorsForMismatchedFacilityValues(csvData, errors, row, field, errorMessage, exporterName);

    errors.push(...generatedErrors);
  }

  return errors;
};
