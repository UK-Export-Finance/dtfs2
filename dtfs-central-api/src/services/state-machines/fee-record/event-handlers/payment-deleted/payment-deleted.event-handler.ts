import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type PaymentDeletedEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  hasAttachedPayments: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordPaymentDeletedEvent = BaseFeeRecordEvent<'PAYMENT_DELETED', PaymentDeletedEventPayload>;

export const handleFeeRecordPaymentDeletedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, hasAttachedPayments, requestSource }: PaymentDeletedEventPayload,
): Promise<FeeRecordEntity> => {
  let status: FeeRecordStatus = 'MATCH';
  if (!feeRecordsAndPaymentsMatch) {
    status = hasAttachedPayments ? 'DOES_NOT_MATCH' : 'TO_DO';
  }
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
