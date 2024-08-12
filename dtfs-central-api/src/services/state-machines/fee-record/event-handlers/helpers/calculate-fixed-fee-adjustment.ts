import Big from 'big.js';
import { FacilityUtilisationDataEntity, FeeRecordEntity, isEqualReportPeriod, ReportPeriod } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';

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

  if (isEqualReportPeriod(reportPeriod, facilityUtilisationData.reportPeriod)) {
    throw new Error('Fee record report period cannot be the same as the facility utilisation data report period');
  }

  const previousPeriodFixedFee = facilityUtilisationData.fixedFee;
  const currentPeriodFixedFee = await getFixedFeeForFacility(feeRecord.facilityId, feeRecord.facilityUtilisation, reportPeriod);
  return new Big(currentPeriodFixedFee).sub(previousPeriodFixedFee).round(2).toNumber();
};
