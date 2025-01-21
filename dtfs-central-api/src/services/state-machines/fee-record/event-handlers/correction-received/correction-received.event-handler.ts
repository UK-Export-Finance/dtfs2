import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordCorrectionEntity, FeeRecordEntity, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';
import { getCorrectionCorrectedValuesFromFormData, getCorrectionPreviousValuesFromFeeRecord } from '../../../../../helpers';

type CorrectionReceivedEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
  correctionEntity: FeeRecordCorrectionEntity;
  correctionFormData: RecordCorrectionTransientFormData;
};

export type FeeRecordCorrectionReceivedEvent = BaseFeeRecordEvent<'CORRECTION_RECEIVED', CorrectionReceivedEventPayload>;

/**
 * Handler for the correction received event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified fee record
 */
export const handleFeeRecordCorrectionReceivedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource, correctionEntity, correctionFormData }: CorrectionReceivedEventPayload,
): Promise<FeeRecordEntity> => {
  const { reasons } = correctionEntity;

  const previousValues = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);
  const correctedValues = getCorrectionCorrectedValuesFromFormData(correctionFormData, reasons);

  correctionEntity.completeCorrection({ previousValues, correctedValues, bankCommentary: correctionFormData.additionalComments ?? null });

  await transactionEntityManager.save(FeeRecordCorrectionEntity, correctionEntity);

  feeRecord.updateWithCorrection({ requestSource, correctedValues });

  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
