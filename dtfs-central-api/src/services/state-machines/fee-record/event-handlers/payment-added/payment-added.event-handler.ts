import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type PaymentAddedEventPayload = {
  transactionEntityManager: EntityManager;
  status: Extract<FeeRecordStatus, 'MATCH' | 'DOES_NOT_MATCH'>;
  requestSource: DbRequestSource;
};

export type FeeRecordPaymentAddedEvent = BaseFeeRecordEvent<'PAYMENT_ADDED', PaymentAddedEventPayload>;

export const handleFeeRecordPaymentAddedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, status, requestSource }: PaymentAddedEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
