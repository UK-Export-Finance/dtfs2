import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type MarkAsReadyToKeyEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordMarkAsReadyToKeyEvent = BaseFeeRecordEvent<'MARK_AS_READY_TO_KEY', MarkAsReadyToKeyEventPayload>;

export const handleFeeRecordMarkAsReadyToKeyEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: MarkAsReadyToKeyEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.markAsReadyToKey({ requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
