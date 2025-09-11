import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
};

export type FeeRecordGenerateKeyingDataEvent = BaseFeeRecordEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

/**
 * Handler for the generate keying data event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordGenerateKeyingDataEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource }: GenerateKeyingDataEventPayload,
): Promise<FeeRecordEntity> => {
  const feeRecordCanBeAutoReconciled = feeRecord.feesPaidToUkefForThePeriod === 0;

  const statusToUpdateTo = feeRecordCanBeAutoReconciled ? FEE_RECORD_STATUS.RECONCILED : FEE_RECORD_STATUS.READY_TO_KEY;

  feeRecord.updateWithStatus({ status: statusToUpdateTo, requestSource });

  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
