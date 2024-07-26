import Big from 'big.js';
import { FacilityUtilisationDataEntity, FeeRecordEntity } from '@ukef/dtfs2-common';

/**
 * Calculates the principal balance adjustment for the given
 * fee record and facility utilisation data
 * @param feeRecord - The fee record
 * @param facilityUtilisationData - The facility utilisation data
 * @returns The principal balance adjustment
 */
export const calculatePrincipalBalanceAdjustment = (feeRecord: FeeRecordEntity, facilityUtilisationData: FacilityUtilisationDataEntity): number =>
  new Big(feeRecord.facilityUtilisation).sub(facilityUtilisationData.utilisation).toNumber();
