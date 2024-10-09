import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity, ApiError } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { SendReportReconciledEmail } from '../helpers/send-report-reconciled-email';
import { TransactionFailedError } from '../../../../../errors';

type MarkFeeRecordsAsReconciledEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
  feeRecordsToReconcile: FeeRecordEntity[];
  reconciledByUserId: string;
};

export type UtilisationReportMarkFeeRecordsAsReconciledEvent = BaseUtilisationReportEvent<
  'MARK_FEE_RECORDS_AS_RECONCILED',
  MarkFeeRecordsAsReconciledEventPayload
>;

/**
 * Handler for the mark fee records as reconciled event
 * if the report has all fee records reconciled, the report status is updated to RECONCILIATION_COMPLETED
 * and an email is sent to the bank
 * @param report - The report
 * @param param - The payload
 * @param param.requestSource - The request source
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsToReconcile - The fee records to reconcile
 * @returns The modified report
 */
export const handleUtilisationReportMarkFeeRecordsAsReconciledEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager, feeRecordsToReconcile, reconciledByUserId }: MarkFeeRecordsAsReconciledEventPayload,
): Promise<UtilisationReportEntity> => {
  try {
    const feeRecordStateMachines = feeRecordsToReconcile.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
    await Promise.all(
      feeRecordStateMachines.map((stateMachine) =>
        stateMachine.handleEvent({
          type: 'MARK_AS_RECONCILED',
          payload: {
            transactionEntityManager,
            reconciledByUserId,
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
      await transactionEntityManager.save(UtilisationReportEntity, report);
      await SendReportReconciledEmail(report);
    }

    return report;
  } catch (error) {
    console.error(`Failed to mark fee records as reconciled - handleUtilisationReportMarkFeeRecordsAsReconciledEvent %o`, error);

    if (error instanceof ApiError) {
      throw TransactionFailedError.forApiError(error);
    }
    if (error instanceof Error) {
      throw TransactionFailedError.forError(error);
    }
    throw TransactionFailedError.forUnknownError();
  }
};
