import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { NotFoundError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { feeRecordsAndPaymentsMatch } from '../../../../../helpers';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type DeletePaymentEventPayload = {
  transactionEntityManager: EntityManager;
  paymentId: number;
  requestSource: DbRequestSource;
};

export type UtilisationReportDeletePaymentEvent = BaseUtilisationReportEvent<typeof UTILISATION_REPORT_EVENT_TYPE.DELETE_PAYMENT, DeletePaymentEventPayload>;

/**
 * Handler for the delete payment event
 * @param report - The report
 * @param param - The payload
 * @param param.paymentId - The payment id
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified report
 */
export const handleUtilisationReportDeletePaymentEvent = async (
  report: UtilisationReportEntity,
  { paymentId, transactionEntityManager, requestSource }: DeletePaymentEventPayload,
): Promise<UtilisationReportEntity> => {
  const payment = await transactionEntityManager.findOne(PaymentEntity, { where: { id: paymentId }, relations: { feeRecords: { corrections: true } } });

  if (!payment) {
    throw new NotFoundError(`Failed to find a payment with id: ${paymentId}`);
  }

  const linkedFeeRecords = payment.feeRecords;

  if (linkedFeeRecords.length === 0) {
    await transactionEntityManager.remove(payment);
    return report;
  }

  await transactionEntityManager.remove(payment);

  const feeRecordFromGroupWithPayments = await transactionEntityManager.findOne(FeeRecordEntity, {
    where: { id: linkedFeeRecords[0].id },
    relations: { payments: true },
  });

  if (!feeRecordFromGroupWithPayments) {
    throw new NotFoundError(`Failed to find a fee record with id '${linkedFeeRecords[0].id}'`);
  }

  const remainingLinkedPayments = feeRecordFromGroupWithPayments.payments;

  const feesAndPaymentsMatch = await feeRecordsAndPaymentsMatch(linkedFeeRecords, remainingLinkedPayments, transactionEntityManager);

  const hasAttachedPayments = remainingLinkedPayments.length > 0;

  await Promise.all(
    linkedFeeRecords.map((feeRecord) => {
      const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

      const hasCorrections = feeRecord.corrections.length > 0;

      return stateMachine.handleEvent({
        type: 'PAYMENT_DELETED',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch: feesAndPaymentsMatch,
          hasAttachedPayments,
          hasCorrections,
          requestSource,
        },
      });
    }),
  );

  return report;
};
