import Big from 'big.js';
import { differenceInDays, isBefore, startOfMonth } from 'date-fns';
import { getDateFromMonthAndYear, MonthAndYear, ReportPeriod } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { NotFoundError } from '../../../../../errors';
import { convertTimestampToDate, getLatestCompletedAmendmentCoverEndDate } from '../../../../../helpers';

/**
 * An admin fee (fixed at 10%) is applied to the fixed fee, meaning
 * we subtract this amount when calculating it
 */
const BANK_ADMIN_FEE_ADJUSTMENT = 0.9;

const getLatestTfmFacilityValues = async (
  facilityId: string,
): Promise<{
  coverEndDate: Date;
  coverStartDate: Date;
  dayCountBasis: number;
  interestPercentage: number;
}> => {
  const tfmFacility = await TfmFacilitiesRepo.findOneByUkefFacilityId(facilityId);
  if (!tfmFacility) {
    throw new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`);
  }

  const { coverEndDate: snapshotCoverEndDate, coverStartDate, dayCountBasis, interestPercentage } = tfmFacility.facilitySnapshot;
  const latestAmendedCoverEndDate = getLatestCompletedAmendmentCoverEndDate(tfmFacility);

  const coverEndDate = latestAmendedCoverEndDate ?? snapshotCoverEndDate;
  if (!coverEndDate) {
    throw new NotFoundError(`Failed to find a cover end date for the tfm facility with ukef facility id '${facilityId}`);
  }

  if (!coverStartDate) {
    throw new NotFoundError(`Failed to find a cover start date for the tfm facility with ukef facility id '${facilityId}`);
  }

  return {
    coverEndDate: convertTimestampToDate(coverEndDate),
    coverStartDate: convertTimestampToDate(coverStartDate),
    dayCountBasis,
    interestPercentage: new Big(interestPercentage).div(100).toNumber(),
  };
};

const getNumberOfDaysRemainingInCoverPeriod = (reportPeriodStart: MonthAndYear, coverStartDate: Date, coverEndDate: Date): number => {
  const currentReportPeriodStartMonthStart = startOfMonth(getDateFromMonthAndYear(reportPeriodStart));

  if (isBefore(currentReportPeriodStartMonthStart, coverStartDate)) {
    return differenceInDays(coverEndDate, coverStartDate);
  }
  return differenceInDays(coverEndDate, currentReportPeriodStartMonthStart);
};

/**
 * Calculates the fixed fee for the given report period
 * @param utilisation - The facility utilisation
 * @param facilityId - The ukef facility id
 * @param reportPeriod - The report period
 * @returns The fixed fee for the current report period
 */
export const calculateFixedFee = async (utilisation: number, facilityId: string, reportPeriod: ReportPeriod): Promise<number> => {
  const { coverEndDate, coverStartDate, dayCountBasis, interestPercentage } = await getLatestTfmFacilityValues(facilityId);

  const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysRemainingInCoverPeriod(reportPeriod.start, coverStartDate, coverEndDate);

  return new Big(utilisation)
    .mul(interestPercentage)
    .mul(BANK_ADMIN_FEE_ADJUSTMENT)
    .mul(numberOfDaysRemainingInCoverPeriod)
    .div(dayCountBasis)
    .round(2)
    .toNumber();
};
