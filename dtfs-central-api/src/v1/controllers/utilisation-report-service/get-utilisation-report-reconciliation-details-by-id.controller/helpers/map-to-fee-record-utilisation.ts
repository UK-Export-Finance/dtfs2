import { FeeRecordEntity, TfmFacility, FeeRecordUtilisation, ReportPeriod, getDateFromMonthAndYear } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { endOfMonth } from 'date-fns';
import { getEffectiveFacilityValueAmendment } from '../../../../../helpers';

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
 * Maps a fee record entity and the tfm facility it corresponds to,
 * to the utilisation details for that fee record
 * @param feeRecord - The fee record
 * @param tfmFacility - the tfm facility
 * @returns the mapped utilisation details
 */
export const mapToFeeRecordUtilisation = (feeRecord: FeeRecordEntity, tfmFacility: TfmFacility, reportPeriod: ReportPeriod): FeeRecordUtilisation => {
  const {
    id,
    facilityId,
    baseCurrency,
    exporter,
    facilityUtilisation: utilisation,
    totalFeesAccruedForThePeriod,
    totalFeesAccruedForThePeriodCurrency,
    feesPaidToUkefForThePeriod,
    feesPaidToUkefForThePeriodCurrency,
  } = feeRecord;

  const { value: facilitySnapshotValue, coverPercentage } = tfmFacility.facilitySnapshot;

  const endDateOfReportPeriod = endOfMonth(getDateFromMonthAndYear(reportPeriod.end));
  const amendedValue = getEffectiveFacilityValueAmendment(tfmFacility, endDateOfReportPeriod);

  const value = amendedValue === null ? facilitySnapshotValue : amendedValue;

  return {
    feeRecordId: id,
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
};
