import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { KeyingSheetCalculationFacilityValues } from '../types/tfm/tfm-facility';

/**
 * Gets TFM facility values with the supplied facility id for keying sheet calculations
 * @param facilityId - The facility id
 * @param reportPeriod - The report period
 * @returns TFM facility values - coverPercentage, value
 */
export const getKeyingSheetCalculationFacilityValues = async (facilityId: string): Promise<KeyingSheetCalculationFacilityValues> => {
  const tfmFacility = await TfmFacilitiesRepo.findOneByUkefFacilityId(facilityId);

  if (!tfmFacility) {
    throw new NotFoundError(`TFM facility with ukefFacilityId '${facilityId}' could not be found`);
  }

  const { value, coverPercentage } = tfmFacility.facilitySnapshot;

  return { value, coverPercentage };
};
