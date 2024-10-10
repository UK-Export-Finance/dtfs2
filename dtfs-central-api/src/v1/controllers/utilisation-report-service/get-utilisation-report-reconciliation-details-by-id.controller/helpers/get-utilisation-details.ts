import { FeeRecordEntity, TfmFacility, FeeRecordUtilisation } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { NotFoundError } from '../../../../../errors';
import { mapToFeeRecordUtilisation } from './map-to-fee-record-utilisation';

/**
 * Retrieves and constructs utilisation data for the given fee records
 * @param feeRecords - The fee records
 * @returns Utilisation data for each fee record
 */
export const getUtilisationDetails = async (feeRecords: FeeRecordEntity[]): Promise<FeeRecordUtilisation[]> => {
  try {
    const allFacilityIds = feeRecords.map((feeRecord) => feeRecord.facilityId);

    const tfmFacilities = await TfmFacilitiesRepo.findByUkefFacilityIds(allFacilityIds);

    const tfmFacilitiesRecord: Record<string, TfmFacility> = {};

    tfmFacilities.forEach((tfmFacility) => {
      const { ukefFacilityId } = tfmFacility.facilitySnapshot;
      if (ukefFacilityId) {
        tfmFacilitiesRecord[ukefFacilityId] = tfmFacility;
      }
    });

    return feeRecords.map((feeRecord) => {
      const { facilityId } = feeRecord;

      const tfmFacility = tfmFacilitiesRecord[facilityId];

      if (!tfmFacility) {
        throw new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`);
      }

      return mapToFeeRecordUtilisation(feeRecord, tfmFacility);
    });
  } catch (error) {
    console.error('Failed to get utilisation details %o', error);
    throw error;
  }
};
