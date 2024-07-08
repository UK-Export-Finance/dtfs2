import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type KeyingDataGeneratedEventPayload = {
  transactionEntityManager: EntityManager;
  generateKeyingData: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordKeyingDataGeneratedEvent = BaseFeeRecordEvent<'KEYING_DATA_GENERATED', KeyingDataGeneratedEventPayload>;

export const handleFeeRecordKeyingDataGeneratedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, generateKeyingData, requestSource }: KeyingDataGeneratedEventPayload,
): Promise<FeeRecordEntity> => {
  if (generateKeyingData) {
    feeRecord.updateWithKeyingData({ fixedFeeAdjustment: 10, premiumAccrualBalanceAdjustment: 10, principalBalanceAdjustment: 10, requestSource });
    return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
  }
  feeRecord.updateWithStatus({ status: 'READY_TO_KEY', requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
