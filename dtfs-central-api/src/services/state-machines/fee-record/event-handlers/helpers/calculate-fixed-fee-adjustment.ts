import Big from 'big.js';
import { FacilityUtilisationDataEntity, FeeRecordEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { calculateFixedFee } from './calculate-fixed-fee';

/**
 * Calculates the fixed fee adjustment
 * @param feeRecord - The fee record entity
 * @param facilityUtilisationData - The facility utilisation data entity
 * @param reportPeriod - The report period
 * @returns The fixed fee adjustment
 * @throws {Error} If the supplied fee record facility id does not match the facility utilisation data id
 */
export const calculateFixedFeeAdjustment = async (
  feeRecord: FeeRecordEntity,
  facilityUtilisationData: FacilityUtilisationDataEntity,
  reportPeriod: ReportPeriod,
): Promise<number> => {
  if (feeRecord.facilityId !== facilityUtilisationData.id) {
    throw new Error('Fee record facility id does not match the facility utilisation id');
  }
  const previousPeriodFixedFee = await calculateFixedFee(facilityUtilisationData.utilisation, facilityUtilisationData.id, facilityUtilisationData.reportPeriod);
  const currentPeriodFixedFee = await calculateFixedFee(feeRecord.facilityUtilisation, feeRecord.facilityId, reportPeriod);
  return new Big(currentPeriodFixedFee).sub(previousPeriodFixedFee).round(2).toNumber();
};
