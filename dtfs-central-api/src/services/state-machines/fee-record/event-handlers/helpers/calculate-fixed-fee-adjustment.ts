import Big from 'big.js';
import { differenceInDays, isBefore } from 'date-fns';
import { FeeRecordEntity, getStartOfReportPeriod, ReportPeriod } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';

const getUkefMarginLessTenPercent = async (facilityId: string): Promise<number> => {
  const coverPercentage = await TfmFacilitiesRepo.getCoverPercentageByUkefFacilityId(facilityId); // this information shouldn't be needed
  const interestPercentage = await TfmFacilitiesRepo.getInterestPercentageByUkefFacilityId(facilityId);
  return new Big(coverPercentage).mul(interestPercentage).mul(0.9).toNumber();
};

const getNumberOfDaysRemainingInCoverPeriod = async (facilityId: string, reportPeriod: ReportPeriod): Promise<number> => {
  const coverEndDate = await TfmFacilitiesRepo.getCoverEndDateByUkefFacilityId(facilityId);
  const coverStartDate = await TfmFacilitiesRepo.getCoverStartDateByUkefFacilityId(facilityId);
  const currentReportPeriodStartDate = getStartOfReportPeriod(reportPeriod);

  if (isBefore(currentReportPeriodStartDate, coverStartDate)) {
    return differenceInDays(coverEndDate, coverStartDate);
  }
  return differenceInDays(coverEndDate, currentReportPeriodStartDate);
};

export const calculateFixedFeeAdjustment = async (feeRecord: FeeRecordEntity, reportPeriod: ReportPeriod): Promise<number> => {
  const ukefMarginLessTenPercent = await getUkefMarginLessTenPercent(feeRecord.facilityId);
  const numberOfDaysRemainingInCoverPeriod = await getNumberOfDaysRemainingInCoverPeriod(feeRecord.facilityId, reportPeriod);
  const dayCountBasis = await TfmFacilitiesRepo.getDayCountBasisByUkefFacilityId(feeRecord.facilityId);
  return new Big(feeRecord.facilityUtilisationData.utilisation)
    .mul(ukefMarginLessTenPercent)
    .mul(numberOfDaysRemainingInCoverPeriod)
    .div(dayCountBasis)
    .sub(feeRecord.getTotalFeesAccruedForThePeriodInTheBaseCurrency())
    .round(2)
    .toNumber();
};
