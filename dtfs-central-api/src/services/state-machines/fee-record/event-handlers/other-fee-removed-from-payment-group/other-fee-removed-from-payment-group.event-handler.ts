import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
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
 * @returns The modified fee record
 */
export const handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: OtherFeeRemovedFromPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? 'MATCH' : 'DOES_NOT_MATCH';
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
