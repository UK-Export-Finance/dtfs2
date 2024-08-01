import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';
import { calculatePrincipalBalanceAdjustment, calculateFixedFeeAdjustment } from '../helpers';

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
    feeRecord.updateWithStatus({ status: 'READY_TO_KEY', requestSource });
    return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
  }

  const fixedFeeAdjustment = await calculateFixedFeeAdjustment(feeRecord, feeRecord.facilityUtilisationData, reportPeriod);
  const principalBalanceAdjustment = calculatePrincipalBalanceAdjustment(feeRecord, feeRecord.facilityUtilisationData);
  feeRecord.updateWithKeyingData({
    fixedFeeAdjustment,
    premiumAccrualBalanceAdjustment: 10,
    principalBalanceAdjustment,
    requestSource,
  });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
