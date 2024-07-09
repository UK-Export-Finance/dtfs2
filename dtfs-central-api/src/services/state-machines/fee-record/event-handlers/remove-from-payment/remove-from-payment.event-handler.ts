import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type RemoveFromPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordRemoveFromPaymentEvent = BaseFeeRecordEvent<'REMOVE_FROM_PAYMENT', RemoveFromPaymentEventPayload>;

export const handleFeeRecordRemoveFromPaymentEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: RemoveFromPaymentEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.removeAllPayments({ requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
