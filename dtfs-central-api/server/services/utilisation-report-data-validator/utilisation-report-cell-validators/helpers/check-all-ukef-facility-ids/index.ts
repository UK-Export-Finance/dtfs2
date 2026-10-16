import { UTILISATION_REPORT_HEADERS, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';

/**
 * Checks all UKEF facility IDs in the CSV data and adds a match status to each facility ID cell.
 * First it creates a list of unique facility IDs from the provided CSV data
 * Then it queries the TFM facilities repository to check if each facility ID exists
 * Finally it returns the CSV data with an additional property `ukefFacilityIdMatches` on each facility ID cell
 * indicating whether the facility ID exists in the TFM facilities repository.
 * @param csvData - The data from the uploaded CSV file
 * @returns csvData with an additional property `ukefFacilityIdMatches` on each facility ID cell
 */
export const checkAllUkefFacilityIds = async (csvData: UtilisationReportCsvRowData[]): Promise<UtilisationReportCsvRowData[]> => {
  // Create a list of unique facility IDs from the CSV data
  const facilityIds = csvData
    .map((row) => row[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]?.value)
    .filter((facilityId): facilityId is string => Boolean(facilityId));
  const uniqueFacilityIds = [...new Set(facilityIds)];

  // If there are no facility IDs, return the original CSV data
  if (!uniqueFacilityIds.length) {
    return csvData;
  }

  // Query the TFM facilities repository to check if each facility ID exists
  const matchStatusByFacilityId = await TfmFacilitiesRepo.ukefGefFacilitiesExist(uniqueFacilityIds);

  // Add the status to the cell consumed by the facility ID validator, leaving rows with no ID unchanged.
  return csvData.map((row) => {
    const facilityId = row[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]?.value;

    if (!facilityId) {
      return row;
    }

    return {
      ...row,
      [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: {
        ...row[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
        ukefFacilityIdMatches: matchStatusByFacilityId[facilityId] ?? false,
      },
    };
  });
};
