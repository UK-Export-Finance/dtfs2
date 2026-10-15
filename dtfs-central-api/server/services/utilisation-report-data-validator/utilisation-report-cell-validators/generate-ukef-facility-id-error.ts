import { UtilisationReportCsvCellData, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { UKEF_FACILITY_ID_REGEX } from '../../../constants/regex';
import { TfmFacilitiesRepo } from '../../../repositories/tfm-facilities-repo';

/**
 * Generate and return an error for the facility id cell if value is invalid
 * @param facilityIdCellData - The cell data for the facility id cell
 * @param exporterName - The name of the exporter for that csv row
 * @param existingUkefGefFacilityIds - Pre-fetched set of UKEF facility IDs which exist as GEF facilities. If not supplied, the database is queried.
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateUkefFacilityIdError = async (
  facilityIdCellData: UtilisationReportCsvCellData | undefined,
  exporterName?: string | null,
  existingUkefGefFacilityIds?: Set<string>,
): Promise<UtilisationReportDataValidationError | null> => {
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

  const ukefGefFacilityExists = existingUkefGefFacilityIds
    ? existingUkefGefFacilityIds.has(facilityIdCellData.value)
    : await TfmFacilitiesRepo.ukefGefFacilityExists(facilityIdCellData.value);

  if (!ukefGefFacilityExists) {
    return {
      errorMessage: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
      column: facilityIdCellData?.column,
      row: facilityIdCellData?.row,
      value: facilityIdCellData?.value,
      exporter: exporterName,
    };
  }

  return null;
};
