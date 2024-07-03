import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { GenerateKeyingDataDetails } from '../../../../../v1/controllers/utilisation-report-service/post-keying-data.controller/helpers';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  generateKeyingDataDetails: GenerateKeyingDataDetails;
  requestSource: DbRequestSource;
};

export type UtilisationReportGenerateKeyingDataEvent = BaseUtilisationReportEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

export const handleUtilisationReportGenerateKeyingDataEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, generateKeyingDataDetails, requestSource }: GenerateKeyingDataEventPayload,
): Promise<UtilisationReportEntity> => {
  await Promise.all(
    generateKeyingDataDetails.map(({ feeRecord, isFacilityReadyToKey }) => {
      const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);
      return stateMachine.handleEvent({
        type: 'KEYING_DATA_GENERATED',
        payload: {
          transactionEntityManager,
          isFacilityReadyToKey,
          requestSource,
        },
      });
    }),
  );

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
