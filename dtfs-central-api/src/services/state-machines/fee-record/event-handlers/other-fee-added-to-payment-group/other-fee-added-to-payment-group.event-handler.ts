import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type OtherFeeRecordAddedToPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAndPaymentsMatch: boolean;
  requestSource: DbRequestSource;
};

export type FeeRecordOtherFeeAddedToPaymentGroupEvent = BaseFeeRecordEvent<'OTHER_FEE_ADDED_TO_PAYMENT_GROUP', OtherFeeRecordAddedToPaymentGroupEventPayload>;

export const handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, feeRecordsAndPaymentsMatch, requestSource }: OtherFeeRecordAddedToPaymentGroupEventPayload,
): Promise<FeeRecordEntity> => {
  const status: FeeRecordStatus = feeRecordsAndPaymentsMatch ? 'MATCH' : 'DOES_NOT_MATCH';
  feeRecord.updateWithStatus({ status, requestSource });
  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
