import { ReportPeriod } from '@ukef/dtfs2-common';
import { calculateFixedFee } from './calculate-fixed-fee';

/**
 * Gets the fixed fee for the given report period
 * calculates ukef share of utilisation from provided utilisation value and cover percentage
 * @param facilityId - The (ukef) facility id
 * @param reportPeriod - The report period
 * @param coverEndDate - TFM facility cover end date
 * @param interestPercentage - TFM facility interest percentage value
 * @param dayCountBasis - TFM facility day count basis value
 * @param ukefShareOfUtilisation - Calculated ukef share of utilisation
 * @returns The fixed fee for the supplied report period
 */
export const getFixedFeeForFacility = (
  reportPeriod: ReportPeriod,
  coverEndDate: Date,
  interestPercentage: number,
  dayCountBasis: number,
  ukefShareOfUtilisation: number,
) => {
  return calculateFixedFee({
    ukefShareOfUtilisation,
    reportPeriod,
    coverEndDate,
    interestPercentage,
    dayCountBasis,
  });
};
