import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, RECONCILIATION_COMPLETED, RECONCILIATION_IN_PROGRESS, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type MarkFeeRecordsAsReadyToKeyEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
  feeRecordsToMarkAsReadyToKey: FeeRecordEntity[];
};

export type UtilisationReportMarkFeeRecordsAsReadyToKeyEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY,
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
  for (const feeRecord of feeRecordsToMarkAsReadyToKey) {
    const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

    await stateMachine.handleEvent({
      type: 'MARK_AS_READY_TO_KEY',
      payload: {
        transactionEntityManager,
        requestSource,
      },
    });
  }

  if (report.status === RECONCILIATION_COMPLETED) {
    report.updateWithStatus({ status: RECONCILIATION_IN_PROGRESS, requestSource });
    return await transactionEntityManager.save(UtilisationReportEntity, report);
  }

  return report;
};
