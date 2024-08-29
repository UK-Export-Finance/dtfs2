import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type RemoveFromPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordRemoveFromPaymentGroupEvent = BaseFeeRecordEvent<'REMOVE_FROM_PAYMENT_GROUP', RemoveFromPaymentGroupEventPayload>;

/**
 * Handler for the remove from payment group event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @returns The modified fee record
 */
export const handleFeeRecordRemoveFromPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: RemoveFromPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.removeAllPayments({ requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
