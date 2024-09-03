import { UKEF_FACILITY_ID_REGEX } from '../../../constants/regex';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';
import { FacilityUtilisationDataRepo } from '../../../repositories/facility-utilisation-data-repo';

/**
 * Generate and return an error for the facility id cell if value is invalid
 * @param facilityIdCellData - The cell data for the facility id cell
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateUkefFacilityIdError: UtilisationReportCellValidationErrorGenerator = async (facilityIdCellData, exporterName) => {
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

  const facilityUtilisationDataExists = await FacilityUtilisationDataRepo.existsById(facilityIdCellData.value);

  if (!facilityUtilisationDataExists) {
    return {
      errorMessage: 'The Facility ID has not been recognised. Enter a valid Facility ID between 8 and 10 characters.',
      column: facilityIdCellData?.column,
      row: facilityIdCellData?.row,
      value: facilityIdCellData?.value,
      exporter: exporterName,
    };
  }

  return null;
};
