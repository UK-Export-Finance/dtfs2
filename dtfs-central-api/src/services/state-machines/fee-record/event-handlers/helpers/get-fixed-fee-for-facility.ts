import { ReportPeriod } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { NotFoundError } from '../../../../../errors';
import { convertTimestampToDate, getLatestCompletedAmendmentCoverEndDate } from '../../../../../helpers';
import { calculateFixedFee } from './calculate-fixed-fee';

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
    interestPercentage,
  };
};

/**
 * Gets the fixed fee for the given report period
 * @param facilityId - The (ukef) facility id
 * @param utilisation - The facility utilisation
 * @param reportPeriod - The report period
 * @returns The fixed fee for the supplied report period
 */
export const getFixedFeeForFacility = async (facilityId: string, utilisation: number, reportPeriod: ReportPeriod) => {
  const { coverEndDate, coverStartDate, dayCountBasis, interestPercentage } = await getLatestTfmFacilityValues(facilityId);
  return calculateFixedFee({
    utilisation,
    reportPeriod,
    coverStartDate,
    coverEndDate,
    interestPercentage,
    dayCountBasis,
  });
};
