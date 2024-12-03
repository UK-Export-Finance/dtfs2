import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
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
    const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? FEE_RECORD_STATUS.MATCH : FEE_RECORD_STATUS.DOES_NOT_MATCH;
    feeRecord.updateWithStatus({ status, requestSource });
    return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
  }

  feeRecord.updateWithStatus({ status: FEE_RECORD_STATUS.TO_DO, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
