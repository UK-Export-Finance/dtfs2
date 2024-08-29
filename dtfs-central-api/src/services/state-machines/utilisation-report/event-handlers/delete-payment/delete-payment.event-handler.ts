import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { NotFoundError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { feeRecordsAndPaymentsMatch } from '../../../../../helpers';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

type DeletePaymentEventPayload = {
  transactionEntityManager: EntityManager;
  paymentId: number;
  requestSource: DbRequestSource;
};

export type UtilisationReportDeletePaymentEvent = BaseUtilisationReportEvent<'DELETE_PAYMENT', DeletePaymentEventPayload>;

/**
 * Handler for the delete payment event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportDeletePaymentEvent = async (
  report: UtilisationReportEntity,
  { paymentId, transactionEntityManager, requestSource }: DeletePaymentEventPayload,
): Promise<UtilisationReportEntity> => {
  const payment = await transactionEntityManager.findOne(PaymentEntity, { where: { id: paymentId }, relations: { feeRecords: true } });

  if (!payment) {
    throw new NotFoundError(`Failed to find a payment with id: ${paymentId}`);
  }

  const linkedFeeRecords = payment.feeRecords;
  if (linkedFeeRecords.length === 0) {
    await transactionEntityManager.remove(payment);
    return report;
  }

  await transactionEntityManager.remove(payment);

  const feeRecordsWithPayments = await transactionEntityManager.findOne(FeeRecordEntity, {
    where: { id: linkedFeeRecords[0].id },
    relations: { payments: true },
  });

  if (!feeRecordsWithPayments) {
    throw new NotFoundError(`Failed to find a fee record with id '${linkedFeeRecords[0].id}'`);
  }

  const remainingLinkedPayments = feeRecordsWithPayments.payments;

  const feesAndPaymentsMatch = await feeRecordsAndPaymentsMatch(linkedFeeRecords, remainingLinkedPayments, transactionEntityManager);
  const feeRecordStateMachines = linkedFeeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'PAYMENT_DELETED',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch: feesAndPaymentsMatch,
          hasAttachedPayments: remainingLinkedPayments.length > 0,
          requestSource,
        },
      }),
    ),
  );

  return report;
};
