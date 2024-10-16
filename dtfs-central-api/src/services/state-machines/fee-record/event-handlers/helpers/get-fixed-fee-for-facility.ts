import { ReportPeriod } from '@ukef/dtfs2-common';
import { calculateUkefShareOfUtilisation, getLatestTfmFacilityValues } from '../../../../../helpers';
import { calculateFixedFee } from './calculate-fixed-fee';

/**
 * Gets the fixed fee for the given report period
 * calculates ukef share of utilisation from provided utilisation value and cover percentage
 * @param facilityId - The (ukef) facility id
 * @param utilisation - The facility utilisation
 * @param reportPeriod - The report period
 * @returns The fixed fee for the supplied report period
 */
export const getFixedFeeForFacility = async (facilityId: string, utilisation: number, reportPeriod: ReportPeriod) => {
  const { coverEndDate, dayCountBasis, interestPercentage, coverPercentage } = await getLatestTfmFacilityValues(facilityId);

  const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

  return calculateFixedFee({
    utilisation: ukefShareOfUtilisation,
    reportPeriod,
    coverEndDate,
    interestPercentage,
    dayCountBasis,
  });
};
