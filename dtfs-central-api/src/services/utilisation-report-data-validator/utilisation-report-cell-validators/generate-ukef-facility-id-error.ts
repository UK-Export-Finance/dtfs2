import { UKEF_FACILITY_ID_REGEX } from '../../../constants/regex';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

export const generateUkefFacilityIdError: UtilisationReportCellValidationErrorGenerator = (facilityIdObject, exporterName) => {
  if (!facilityIdObject?.value) {
    return {
      errorMessage: 'UKEF facility ID must have an entry',
      column: facilityIdObject?.column,
      row: facilityIdObject?.row,
      value: facilityIdObject?.value,
      exporter: exporterName,
    };
  }
  if (!UKEF_FACILITY_ID_REGEX.test(facilityIdObject?.value)) {
    return {
      errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
      column: facilityIdObject?.column,
      row: facilityIdObject?.row,
      value: facilityIdObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};
