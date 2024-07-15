import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

type MarkFeeRecordsAsReconciledEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
  feeRecordIds: number[];
};

export type UtilisationReportMarkFeeRecordsAsReconciledEvent = BaseUtilisationReportEvent<
  'MARK_FEE_RECORDS_AS_RECONCILED',
  MarkFeeRecordsAsReconciledEventPayload
>;

export const handleUtilisationReportMarkFeeRecordsAsReconciledEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager, feeRecordIds }: MarkFeeRecordsAsReconciledEventPayload,
): Promise<UtilisationReportEntity> => {
  const feeRecordsToReconcile = report.feeRecords.filter(({ id }) => feeRecordIds.includes(id));
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

  const { feeRecords: allFeeRecords } = await transactionEntityManager.findOneByOrFail(UtilisationReportEntity, { id: report.id });
  if (allFeeRecords.every((record) => record.status === 'RECONCILED')) {
    report.updateWithStatus({ status: 'RECONCILIATION_COMPLETED', requestSource });
    return await transactionEntityManager.save(UtilisationReportEntity, report);
  }

  return report;
};
