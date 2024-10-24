import { ReportPeriod } from '@ukef/dtfs2-common';
import { calculateUkefShareOfUtilisation } from '../../../../../helpers';
import { calculateFixedFee } from './calculate-fixed-fee';
import { LatestTfmFacilityValues } from '../../../../../types/tfm/tfm-facility';

/**
 * Gets the fixed fee for the given report period
 * calculates ukef share of utilisation from provided utilisation value and cover percentage
 * @param facilityId - The (ukef) facility id
 * @param utilisation - The facility utilisation
 * @param reportPeriod - The report period
 * @param tfmFacilityValues - TFM facility values
 * @returns The fixed fee for the supplied report period
 */
export const getFixedFeeForFacility = (utilisation: number, reportPeriod: ReportPeriod, tfmFacilityValues: LatestTfmFacilityValues) => {
  const { coverPercentage, coverEndDate, interestPercentage, dayCountBasis } = tfmFacilityValues;

  const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

  return calculateFixedFee({
    ukefShareOfUtilisation,
    reportPeriod,
    coverEndDate,
    interestPercentage,
    dayCountBasis,
  });
};
