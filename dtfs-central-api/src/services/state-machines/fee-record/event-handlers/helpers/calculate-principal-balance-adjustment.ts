import Big from 'big.js';
import { FacilityUtilisationDataEntity, FeeRecordEntity } from '@ukef/dtfs2-common';
import { calculateUkefShareOfUtilisation } from '../../../../../helpers';

/**
 * Calculates the principal balance adjustment for the given
 * UKEF share of utilisation from the fee record and facility utilisation data
 * @param feeRecord - The fee record
 * @param facilityUtilisationData - The facility utilisation data
 * @returns The principal balance adjustment
 */
export const calculatePrincipalBalanceAdjustment = (
  feeRecord: FeeRecordEntity,
  facilityUtilisationData: FacilityUtilisationDataEntity,
  coverPercentage: number,
): number => {
  const calculatedUtilisation = calculateUkefShareOfUtilisation(feeRecord.facilityUtilisation, coverPercentage);

  return new Big(calculatedUtilisation).sub(facilityUtilisationData.utilisation).toNumber();
};
