import { UKEF_FACILITY_ID_REGEX } from '../../../constants/regex';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return error for the facility id cell if value is invalid
 * @param facilityIdCellData - The cell data for the facility id cell
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateUkefFacilityIdError: UtilisationReportCellValidationErrorGenerator = (facilityIdCellData, exporterName) => {
  if (!facilityIdCellData?.value) {
    return {
      errorMessage: 'UKEF facility ID must have an entry',
      column: facilityIdCellData?.column,
      row: facilityIdCellData?.row,
      value: facilityIdCellData?.value,
      exporter: exporterName,
    };
  }
  if (!UKEF_FACILITY_ID_REGEX.test(facilityIdCellData.value)) {
    return {
      errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
      column: facilityIdCellData?.column,
      row: facilityIdCellData?.row,
      value: facilityIdCellData?.value,
      exporter: exporterName,
    };
  }
  return null;
};
