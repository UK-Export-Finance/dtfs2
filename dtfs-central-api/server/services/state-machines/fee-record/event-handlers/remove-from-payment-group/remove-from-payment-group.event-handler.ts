import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordCorrectionEntity, FeeRecordEntity } from '@ukef/dtfs2-common';
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
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordRemoveFromPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: RemoveFromPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  const hasCorrections = await transactionEntityManager.existsBy(FeeRecordCorrectionEntity, { feeRecord: { id: feeRecord.id } });

  const status = hasCorrections ? FEE_RECORD_STATUS.TO_DO_AMENDED : FEE_RECORD_STATUS.TO_DO;

  feeRecord.removeAllPayments({ requestSource, status });

  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
