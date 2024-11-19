import Big from 'big.js';
import { FacilityUtilisationDataEntity, FeeRecordEntity, isEqualReportPeriod, ReportPeriod } from '@ukef/dtfs2-common';

const hasFacilityUtilisationDataAlreadyBeenUpdated = (facilityUtilisationData: FacilityUtilisationDataEntity, reportPeriod: ReportPeriod): boolean =>
  isEqualReportPeriod(facilityUtilisationData.reportPeriod, reportPeriod);

/**
 * This is currently unused because fixed fee calculations are currently turned off.
 *
 * Calculates the fixed fee adjustment
 * @param feeRecord - The fee record entity
 * @param facilityUtilisationData - The facility utilisation data entity
 * @param reportPeriod - The report period
 * @param currentPeriodFixedFee - fixed fee for the current report period
 * @returns The fixed fee adjustment
 * @throws {Error} If the supplied fee record facility id does not match the facility utilisation data id
 */
export const calculateFixedFeeAdjustment = (
  feeRecord: FeeRecordEntity,
  facilityUtilisationData: FacilityUtilisationDataEntity,
  reportPeriod: ReportPeriod,
  currentPeriodFixedFee: number,
): number => {
  if (feeRecord.facilityId !== facilityUtilisationData.id) {
    throw new Error('Fee record facility id does not match the facility utilisation id');
  }

  if (hasFacilityUtilisationDataAlreadyBeenUpdated(facilityUtilisationData, reportPeriod)) {
    throw new Error('Fixed fee adjustment must be calculated before the facility utilisation data has been updated');
  }

  const previousPeriodFixedFee = facilityUtilisationData.fixedFee;

  return new Big(currentPeriodFixedFee).sub(previousPeriodFixedFee).round(2).toNumber();
};
