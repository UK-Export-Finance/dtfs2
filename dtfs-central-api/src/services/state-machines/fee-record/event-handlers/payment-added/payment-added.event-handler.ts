import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type PaymentAddedEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordPaymentAddedEvent = BaseFeeRecordEvent<'PAYMENT_ADDED', PaymentAddedEventPayload>;

/**
 * Handler for the payment added event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsAndPaymentsMatch - Whether or not the fee records match the payments
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordPaymentAddedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: PaymentAddedEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? 'MATCH' : 'DOES_NOT_MATCH';
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
