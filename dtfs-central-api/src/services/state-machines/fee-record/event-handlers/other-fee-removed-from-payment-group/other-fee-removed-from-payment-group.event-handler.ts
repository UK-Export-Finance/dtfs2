import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type OtherFeeRemovedFromPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordOtherFeeRemovedFromPaymentGroupEvent = BaseFeeRecordEvent<
  'OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP',
  OtherFeeRemovedFromPaymentGroupEventPayload
>;

/**
 * Handler for the other fee record removed from payment group event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsAndPaymentsMatch - Whether or not the fee records match the payments
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: OtherFeeRemovedFromPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? FEE_RECORD_STATUS.MATCH : FEE_RECORD_STATUS.DOES_NOT_MATCH;
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
