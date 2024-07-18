import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type MarkAsReconciledEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordMarkAsReconciledEvent = BaseFeeRecordEvent<'MARK_AS_RECONCILED', MarkAsReconciledEventPayload>;

export const handleFeeRecordMarkAsReconciledEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: MarkAsReconciledEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.updateWithStatus({ status: 'RECONCILED', requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
