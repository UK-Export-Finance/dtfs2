import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UTILISATION_REPORT_STATUS, UtilisationReportEntity } from '@ukef/dtfs2-common';
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

/**
 * Handler for the mark fee records as ready to key event
 * @param report - The report
 * @param param - The payload
 * @param param.requestSource - The request source
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsToMarkAsReadyToKey - The fee records to mark as ready to key
 * @returns The modified report
 */
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

  if (report.status === UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED) {
    report.updateWithStatus({ status: UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS, requestSource });
    return await transactionEntityManager.save(UtilisationReportEntity, report);
  }

  return report;
};
