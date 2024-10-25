import { endOfMonth } from 'date-fns';
import { getDateFromMonthAndYear, ReportPeriod } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { convertTimestampToDate } from './convert-timestamp-to-date';
import { getEffectiveCoverEndDateAmendment } from './amendments/get-effective-cover-end-date-amendment';
import { SpecificTfmFacilityValues } from '../types/tfm/tfm-facility';

/**
 * Gets the latest values for the TFM facility with the supplied facility id
 * @param facilityId - The facility id
 * @param reportPeriod - The report period
 * @returns The latest values
 */
export const getSpecificTfmFacilityValues = async (facilityId: string, reportPeriod?: ReportPeriod): Promise<SpecificTfmFacilityValues> => {
  const tfmFacility = await TfmFacilitiesRepo.findOneByUkefFacilityId(facilityId);

  if (!tfmFacility) {
    throw new NotFoundError(`TFM facility ${facilityId} could not be found`);
  }

  const { coverEndDate: snapshotCoverEndDate, coverStartDate, dayCountBasis, interestPercentage, coverPercentage, value } = tfmFacility.facilitySnapshot;

  let latestAmendedCoverEndDate;

  if (reportPeriod) {
    const endDateOfReportPeriod = endOfMonth(getDateFromMonthAndYear(reportPeriod.end));
    latestAmendedCoverEndDate = getEffectiveCoverEndDateAmendment(tfmFacility, endDateOfReportPeriod);
  }

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
    value,
  };
};
