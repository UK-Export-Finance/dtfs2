import { FeeRecordEntity, TfmFacility } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { FeeRecordUtilisation } from '../../../../../types/fee-records';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { NotFoundError } from '../../../../../errors';

/**
 * Calculates the exposure based on the current utilisation
 * @param utilisation - The current utilisation of the facility
 * @param coverPercentage - The cover percentage of the facility
 * @returns The exposure
 */
export const calculateExposure = (utilisation: number, coverPercentage: number) => {
  return new Big(utilisation).mul(coverPercentage).div(100).round(2).toNumber();
};

/**
 * Retrieves and constructs utilisation data for the given fee records
 * @param feeRecords - The fee records
 * @returns Utilisation data for each fee record
 */
export const getUtilisationDetails = async (feeRecords: FeeRecordEntity[]): Promise<FeeRecordUtilisation[]> => {
  const allFacilityIds = feeRecords.map((feeRecord) => feeRecord.facilityId);
  const tfmFacilities = await TfmFacilitiesRepo.findByUkefFacilityIds(allFacilityIds);
  const tfmFacilitiesRecord: Record<string, TfmFacility> = {};
  tfmFacilities.forEach((tfmFacility) => {
    const { ukefFacilityId } = tfmFacility.facilitySnapshot;
    if (ukefFacilityId) {
      tfmFacilitiesRecord[ukefFacilityId] = tfmFacility;
    }
  });

  return feeRecords.map(
    ({
      facilityId,
      baseCurrency,
      exporter,
      facilityUtilisation: utilisation,
      totalFeesAccruedForThePeriod,
      totalFeesAccruedForThePeriodCurrency,
      feesPaidToUkefForThePeriod,
      feesPaidToUkefForThePeriodCurrency,
    }) => {
      const tfmFacility = tfmFacilitiesRecord[facilityId];

      if (!tfmFacility) {
        throw new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`);
      }

      const { value, coverPercentage } = tfmFacility.facilitySnapshot;

      return {
        facilityId,
        exporter,
        baseCurrency,
        value,
        utilisation,
        coverPercentage,
        exposure: calculateExposure(utilisation, coverPercentage),
        feesAccrued: { currency: totalFeesAccruedForThePeriodCurrency, amount: totalFeesAccruedForThePeriod },
        feesPayable: { currency: feesPaidToUkefForThePeriodCurrency, amount: feesPaidToUkefForThePeriod },
      };
    },
  );
};
