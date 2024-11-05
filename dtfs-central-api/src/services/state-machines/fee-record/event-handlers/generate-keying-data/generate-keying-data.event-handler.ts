import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus, ReportPeriod } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';
import { calculatePrincipalBalanceAdjustment, calculateFixedFeeAdjustment, updateFacilityUtilisationData, calculateFixedFee } from '../helpers';
import { calculateUkefShareOfUtilisation, getKeyingSheetCalculationFacilityValues } from '../../../../../helpers';

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  isFinalFeeRecordForFacility: boolean;
  reportPeriod: ReportPeriod;
  requestSource: DbRequestSource;
};

export type FeeRecordGenerateKeyingDataEvent = BaseFeeRecordEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

/**
 * Handler for the generate keying data event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.isFinalFeeRecordForFacility - Whether or not the fee record is the final fee record for a facility
 * @param param.reportPeriod - The report period
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordGenerateKeyingDataEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, isFinalFeeRecordForFacility, reportPeriod, requestSource }: GenerateKeyingDataEventPayload,
): Promise<FeeRecordEntity> => {
  if (!isFinalFeeRecordForFacility) {
    const statusToUpdateTo = getStatusToUpdateTo(feeRecord.feesPaidToUkefForThePeriod);
    feeRecord.updateWithStatus({ status: statusToUpdateTo, requestSource });
    return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
  }

  const { coverPercentage, coverEndDate, interestPercentage, dayCountBasis } = await getKeyingSheetCalculationFacilityValues(
    feeRecord.facilityId,
    reportPeriod,
  );

  const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(feeRecord.facilityUtilisation, coverPercentage);

  const fixedFee = calculateFixedFee({
    ukefShareOfUtilisation,
    reportPeriod,
    coverEndDate,
    interestPercentage,
    dayCountBasis,
  });

  const fixedFeeAdjustment = calculateFixedFeeAdjustment(feeRecord, feeRecord.facilityUtilisationData, reportPeriod, fixedFee);

  const principalBalanceAdjustment = calculatePrincipalBalanceAdjustment(ukefShareOfUtilisation, feeRecord.facilityUtilisationData);

  const statusToUpdateTo = getStatusToUpdateTo(feeRecord.feesPaidToUkefForThePeriod, fixedFeeAdjustment, principalBalanceAdjustment);

  feeRecord.updateWithKeyingData({
    status: statusToUpdateTo,
    fixedFeeAdjustment,
    principalBalanceAdjustment,
    requestSource,
  });

  await transactionEntityManager.save(FeeRecordEntity, feeRecord);

  await updateFacilityUtilisationData(feeRecord.facilityUtilisationData, {
    reportPeriod,
    requestSource,
    ukefShareOfUtilisation,
    entityManager: transactionEntityManager,
    fixedFee,
  });

  return feeRecord;
};

function getStatusToUpdateTo(
  feesPaidToUkefForThePeriod: number,
  fixedFeeAdjustment: number = 0,
  principalBalanceAdjustment: number = 0,
): Extract<FeeRecordStatus, 'READY_TO_KEY' | 'RECONCILED'> {
  return feeRecordCanBeAutoReconciled(feesPaidToUkefForThePeriod, fixedFeeAdjustment, principalBalanceAdjustment)
    ? FEE_RECORD_STATUS.RECONCILED
    : FEE_RECORD_STATUS.READY_TO_KEY;
}

function feeRecordCanBeAutoReconciled(feesPaidToUkefForThePeriod: number, fixedFeeAdjustment: number, principalBalanceAdjustment: number): boolean {
  return feesPaidToUkefForThePeriod === 0 && fixedFeeAdjustment === 0 && principalBalanceAdjustment === 0;
}
