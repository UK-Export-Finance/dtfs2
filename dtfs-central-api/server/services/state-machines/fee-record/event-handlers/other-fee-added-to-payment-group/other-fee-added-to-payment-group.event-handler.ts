import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type OtherFeeRecordAddedToPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordOtherFeeAddedToPaymentGroupEvent = BaseFeeRecordEvent<'OTHER_FEE_ADDED_TO_PAYMENT_GROUP', OtherFeeRecordAddedToPaymentGroupEventPayload>;

/**
 * Handler for the other fee record added to payment group event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsAndPaymentsMatch - Whether or not the fee records match the payments
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: OtherFeeRecordAddedToPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? FEE_RECORD_STATUS.MATCH : FEE_RECORD_STATUS.DOES_NOT_MATCH;
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
