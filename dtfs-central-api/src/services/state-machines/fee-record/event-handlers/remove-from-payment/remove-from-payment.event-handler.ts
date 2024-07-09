import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';
import { NotImplementedError } from '../../../../../errors';

type RemoveFromPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordRemoveFromPaymentEvent = BaseFeeRecordEvent<'REMOVE_FROM_PAYMENT', RemoveFromPaymentEventPayload>;

export const handleFeeRecordRemoveFromPaymentEvent = (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: RemoveFromPaymentEventPayload,
): Promise<FeeRecordEntity> => {
  console.error('Not yet implemented, request %o %o %o', feeRecord, transactionEntityManager, requestSource); // TODO: Remove after debug.

  throw new NotImplementedError('TODO FN-1719: Implement.');
};
