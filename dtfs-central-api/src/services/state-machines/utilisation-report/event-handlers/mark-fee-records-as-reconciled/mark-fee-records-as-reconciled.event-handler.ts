import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

type MarkFeeRecordsAsReconciledEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
  feeRecordsToReconcile: FeeRecordEntity[];
};

export type UtilisationReportMarkFeeRecordsAsReconciledEvent = BaseUtilisationReportEvent<
  'MARK_FEE_RECORDS_AS_RECONCILED',
  MarkFeeRecordsAsReconciledEventPayload
>;

/**
 * Handler for the mark fee records as reconciled event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportMarkFeeRecordsAsReconciledEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager, feeRecordsToReconcile }: MarkFeeRecordsAsReconciledEventPayload,
): Promise<UtilisationReportEntity> => {
  const feeRecordStateMachines = feeRecordsToReconcile.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'MARK_AS_RECONCILED',
        payload: {
          transactionEntityManager,
          requestSource,
        },
      }),
    ),
  );

  const { feeRecords: allFeeRecords } = await transactionEntityManager.findOneOrFail(UtilisationReportEntity, {
    where: { id: report.id },
    relations: { feeRecords: true },
  });

  if (allFeeRecords.every((record) => record.status === 'RECONCILED')) {
    report.updateWithStatus({ status: 'RECONCILIATION_COMPLETED', requestSource });
    return await transactionEntityManager.save(UtilisationReportEntity, report);
  }

  return report;
};
