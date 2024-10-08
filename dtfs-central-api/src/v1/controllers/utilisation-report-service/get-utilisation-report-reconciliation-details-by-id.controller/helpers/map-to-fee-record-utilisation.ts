import { FeeRecordEntity, TfmFacility } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { getLatestCompletedAmendmentToFacilityValue } from '../../../../../helpers';

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
 * Maps a fee record entity and the tfm facility it corresponds to to the
 * utilisation details for that fee record
 * @param feeRecord - The fee record
 * @param tfmFacility - the tfm facility
 * @returns the mapped utilisation details
 */
export const mapToFeeRecordUtilisation = (feeRecord: FeeRecordEntity, tfmFacility: TfmFacility) => {
  const {
    facilityId,
    baseCurrency,
    exporter,
    facilityUtilisation: utilisation,
    totalFeesAccruedForThePeriod,
    totalFeesAccruedForThePeriodCurrency,
    feesPaidToUkefForThePeriod,
    feesPaidToUkefForThePeriodCurrency,
  } = feeRecord;
  const { value, coverPercentage } = tfmFacility.facilitySnapshot;
  const amendedValue = getLatestCompletedAmendmentToFacilityValue(tfmFacility);

  return {
    facilityId,
    exporter,
    baseCurrency,
    value: amendedValue ?? value,
    utilisation,
    coverPercentage,
    exposure: calculateExposure(utilisation, coverPercentage),
    feesAccrued: { currency: totalFeesAccruedForThePeriodCurrency, amount: totalFeesAccruedForThePeriod },
    feesPayable: { currency: feesPaidToUkefForThePeriodCurrency, amount: feesPaidToUkefForThePeriod },
  };
};
