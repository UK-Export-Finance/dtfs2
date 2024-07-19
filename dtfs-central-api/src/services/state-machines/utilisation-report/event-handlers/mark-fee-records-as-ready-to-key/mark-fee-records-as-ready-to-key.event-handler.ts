import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

type MarkFeeRecordsAsReadyToKeyEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
  feeRecordsToMarkAsReadyToKey: FeeRecordEntity[];
};

export type UtilisationReportMarkFeeRecordsAsReadyToKeyEvent = BaseUtilisationReportEvent<
  'MARK_FEE_RECORDS_AS_READY_TO_KEY',
  MarkFeeRecordsAsReadyToKeyEventPayload
>;

export const handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager, feeRecordsToMarkAsReadyToKey }: MarkFeeRecordsAsReadyToKeyEventPayload,
): Promise<UtilisationReportEntity> => {
  const feeRecordStateMachines = feeRecordsToMarkAsReadyToKey.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'MARK_AS_READY_TO_KEY',
        payload: {
          transactionEntityManager,
          requestSource,
        },
      }),
    ),
  );

  if (report.status === 'RECONCILIATION_COMPLETED') {
    report.updateWithStatus({ status: 'RECONCILIATION_IN_PROGRESS', requestSource });
    return await transactionEntityManager.save(UtilisationReportEntity, report);
  }

  return report;
};
