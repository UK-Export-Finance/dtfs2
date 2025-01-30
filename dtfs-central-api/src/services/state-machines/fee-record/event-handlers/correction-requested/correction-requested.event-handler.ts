import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordCorrectionEntity, FeeRecordEntity, RecordCorrectionReason, RequestedByUser } from '@ukef/dtfs2-common';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type CorrectionRequestedEventPayload = {
  transactionEntityManager: EntityManager;
  requestSource: DbRequestSource;
  requestedByUser: RequestedByUser;
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
  bankTeamName: string;
  bankTeamEmails: string[];
};

export type FeeRecordCorrectionRequestedEvent = BaseFeeRecordEvent<'CORRECTION_REQUESTED', CorrectionRequestedEventPayload>;

/**
 * Handler for the correction requested event
 * @param feeRecord - The fee record
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @param param.requestedByUser - The user requesting the record correction
 * @param param.reasons - The reasons for the record correction
 * @param param.additionalInfo - The additional information provided to elaborate on the reasons
 * @returns The modified fee record
 */
export const handleFeeRecordCorrectionRequestedEvent = async (
  feeRecord: FeeRecordEntity,
  { transactionEntityManager, requestSource, requestedByUser, reasons, additionalInfo, bankTeamName, bankTeamEmails }: CorrectionRequestedEventPayload,
): Promise<FeeRecordEntity> => {
  const correction = FeeRecordCorrectionEntity.createRequestedCorrection({
    feeRecord,
    requestedByUser,
    reasons,
    additionalInfo,
    requestSource,
    bankTeamName,
    bankTeamEmails,
  });

  await transactionEntityManager.save(FeeRecordCorrectionEntity, correction);

  feeRecord.updateWithStatus({ status: FEE_RECORD_STATUS.PENDING_CORRECTION, requestSource });

  return await transactionEntityManager.save(FeeRecordEntity, feeRecord);
};
