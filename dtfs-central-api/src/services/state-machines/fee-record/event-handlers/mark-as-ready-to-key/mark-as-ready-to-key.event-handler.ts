import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type MarkAsReadyToKeyEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordMarkAsReadyToKeyEvent = BaseFeeRecordEvent<'MARK_AS_READY_TO_KEY', MarkAsReadyToKeyEventPayload>;

/**
 * Handler for the mark as ready to key event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordMarkAsReadyToKeyEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: MarkAsReadyToKeyEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.markAsReadyToKey({ requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
