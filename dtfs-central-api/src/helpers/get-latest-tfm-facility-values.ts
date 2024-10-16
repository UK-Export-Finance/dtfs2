import { endOfMonth } from 'date-fns';
import { getDateFromMonthAndYear, ReportPeriod } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { convertTimestampToDate } from './convert-timestamp-to-date';
import { getEffectiveCoverEndDateAmendment } from './amendments/get-effective-cover-end-date-amendment';

/**
 * Gets the latest values for the TFM facility with the supplied facility id
 * @param facilityId - The facility id
 * @returns The latest values
 */
export const getLatestTfmFacilityValues = async (
  facilityId: string,
  reportPeriod: ReportPeriod,
): Promise<{
  coverEndDate: Date;
  coverStartDate: Date;
  dayCountBasis: number;
  interestPercentage: number;
  coverPercentage: number;
}> => {
  const tfmFacility = await TfmFacilitiesRepo.findOneByUkefFacilityId(facilityId);
  if (!tfmFacility) {
    throw new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`);
  }

  const { coverEndDate: snapshotCoverEndDate, coverStartDate, dayCountBasis, interestPercentage, coverPercentage } = tfmFacility.facilitySnapshot;

  const endDateOfReportPeriod = endOfMonth(getDateFromMonthAndYear(reportPeriod.end));
  const latestAmendedCoverEndDate = getEffectiveCoverEndDateAmendment(tfmFacility, endDateOfReportPeriod);

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
    interestPercentage,
    coverPercentage,
  };
};
