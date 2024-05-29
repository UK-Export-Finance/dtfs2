import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type AddAPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  status: Extract<FeeRecordStatus, 'MATCH' | 'DOES_NOT_MATCH'>;
  requestSource: DbRequestSource;
};

export type FeeRecordAddAPaymentEvent = BaseFeeRecordEvent<'ADD_A_PAYMENT', AddAPaymentEventPayload>;

export const handleFeeRecordAddAPaymentEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, status, requestSource }: AddAPaymentEventPayload,
): Promise<FeeRecordEntity> => {
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
