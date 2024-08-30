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

/**
 * Handler for the payment deleted event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsAndPaymentsMatch - Whether or not the fee records match the payments
 * @param param.hasAttachedPayments - Whether or not the fee record has attached payments
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordPaymentDeletedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, hasAttachedPayments, requestSource }: PaymentDeletedEventPayload,
): Promise<FeeRecordEntity> => {
  if (hasAttachedPayments) {
    const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? 'MATCH' : 'DOES_NOT_MATCH';
    feeRecord.updateWithStatus({ status, requestSource });
    return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
  }

  if (feeRecordsAndPaymentsMatch) {
    throw new Error('Fee records and payments cannot match when there are no attached payments');
  }

  feeRecord.updateWithStatus({ status: 'TO_DO', requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
