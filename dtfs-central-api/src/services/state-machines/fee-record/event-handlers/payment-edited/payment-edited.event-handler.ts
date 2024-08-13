import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type PaymentEditedEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordPaymentEditedEvent = BaseFeeRecordEvent<'PAYMENT_EDITED', PaymentEditedEventPayload>;

export const handleFeeRecordPaymentEditedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: PaymentEditedEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? 'MATCH' : 'DOES_NOT_MATCH';
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
