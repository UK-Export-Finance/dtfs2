import Big from 'big.js';
import { FacilityUtilisationDataEntity } from '@ukef/dtfs2-common';

/**
 * Calculates the principal balance adjustment for the given
 * UKEF share of utilisation from the fee record and facility utilisation data
 * @param ukefShareOfUtilisation - UKEF's share of the utilisation from the report
 * @param facilityUtilisationData - The facility utilisation data
 * @returns The principal balance adjustment
 */
export const calculatePrincipalBalanceAdjustment = (ukefShareOfUtilisation: number, facilityUtilisationData: FacilityUtilisationDataEntity): number => {
  return new Big(ukefShareOfUtilisation).sub(facilityUtilisationData.utilisation).toNumber();
};
