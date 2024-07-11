import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type RemoveFromPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordRemoveFromPaymentGroupEvent = BaseFeeRecordEvent<'REMOVE_FROM_PAYMENT_GROUP', RemoveFromPaymentGroupEventPayload>;

export const handleFeeRecordRemoveFromPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: RemoveFromPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.removeAllPayments({ requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
