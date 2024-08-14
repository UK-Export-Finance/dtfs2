import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus, ReportPeriod } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';
import { calculatePrincipalBalanceAdjustment, calculateFixedFeeAdjustment, updateFacilityUtilisationData } from '../helpers';

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  isFinalFeeRecordForFacility: boolean;
  reportPeriod: ReportPeriod;
  requestSource: DbRequestSource;
};

export type FeeRecordGenerateKeyingDataEvent = BaseFeeRecordEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

export const handleFeeRecordGenerateKeyingDataEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, isFinalFeeRecordForFacility, reportPeriod, requestSource }: GenerateKeyingDataEventPayload,
): Promise<FeeRecordEntity> => {
  if (!isFinalFeeRecordForFacility) {
    const statusToUpdateTo = getStatusToUpdateTo(feeRecord.feesPaidToUkefForThePeriod);
    feeRecord.updateWithStatus({ status: statusToUpdateTo, requestSource });
    return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
  }

  const fixedFeeAdjustment = await calculateFixedFeeAdjustment(feeRecord, feeRecord.facilityUtilisationData, reportPeriod);
  const principalBalanceAdjustment = calculatePrincipalBalanceAdjustment(feeRecord, feeRecord.facilityUtilisationData);
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
    utilisation: feeRecord.facilityUtilisation,
    requestSource,
    entityManager: transactionEntityManager,
  });

  return feeRecord;
};

function getStatusToUpdateTo(feesPaidToUkefForThePeriod: number, fixedFeeAdjustment: number = 0, principalBalanceAdjustment: number = 0): FeeRecordStatus {
  return feeRecordCanBeAutoReconciled(feesPaidToUkefForThePeriod, fixedFeeAdjustment, principalBalanceAdjustment) ? 'RECONCILED' : 'READY_TO_KEY';
}

function feeRecordCanBeAutoReconciled(feesPaidToUkefForThePeriod: number, fixedFeeAdjustment: number, principalBalanceAdjustment: number): boolean {
  return feesPaidToUkefForThePeriod === 0 && fixedFeeAdjustment === 0 && principalBalanceAdjustment === 0;
}
