import { CSV } from '../../../constants';
import { CURRENCY_NUMBER_REGEX } from '../../../constants/regex';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return error for facility utilisation cell if value is invalid
 * @param facilityUtilisationCellData - The cell data for the facility utilisation cell
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateFacilityUtilisationError: UtilisationReportCellValidationErrorGenerator = (facilityUtilisationCellData, exporterName) => {
  if (!facilityUtilisationCellData?.value) {
    return {
      errorMessage: 'Facility utilisation must have an entry',
      column: facilityUtilisationCellData?.column,
      row: facilityUtilisationCellData?.row,
      value: facilityUtilisationCellData?.value,
      exporter: exporterName,
    };
  }

  if (!CURRENCY_NUMBER_REGEX.test(facilityUtilisationCellData.value)) {
    return {
      errorMessage: 'Facility utilisation must be a number with a maximum of two decimal places',
      column: facilityUtilisationCellData?.column,
      row: facilityUtilisationCellData?.row,
      value: facilityUtilisationCellData?.value,
      exporter: exporterName,
    };
  }

  if (facilityUtilisationCellData.value.length > CSV.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Facility utilisation must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: facilityUtilisationCellData?.column,
      row: facilityUtilisationCellData?.row,
      value: facilityUtilisationCellData?.value,
      exporter: exporterName,
    };
  }

  return null;
};
