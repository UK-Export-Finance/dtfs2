import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type MarkAsReconciledEventPayload = {
  transactionEntityManager: EntityManager;
  reconciledByUserId: string;
  requestSource: DbRequestSource;
};

export type FeeRecordMarkAsReconciledEvent = BaseFeeRecordEvent<'MARK_AS_RECONCILED', MarkAsReconciledEventPayload>;

/**
 * Handler for the mark as reconciled event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordMarkAsReconciledEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, reconciledByUserId, requestSource }: MarkAsReconciledEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.markAsReconciled({ reconciledByUserId, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
