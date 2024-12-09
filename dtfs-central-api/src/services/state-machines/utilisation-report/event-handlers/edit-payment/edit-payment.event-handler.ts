import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type EditPayloadEventPayload = {
  transactionEntityManager: EntityManager;
  payment: PaymentEntity;
  feeRecords: FeeRecordEntity[];
  paymentAmount: number;
  datePaymentReceived: Date;
  paymentReference: string | undefined;
  requestSource: DbRequestSource;
};

export type UtilisationReportEditPaymentEvent = BaseUtilisationReportEvent<typeof UTILISATION_REPORT_EVENT_TYPE.EDIT_PAYMENT, EditPayloadEventPayload>;

/**
 * Handler for the edit payment event
 * @param report - The report
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.payment - The payment
 * @param param.feeRecords - The fee records
 * @param param.paymentAmount - The new payment amount
 * @param param.datePaymentReceived - The new date payment received
 * @param param.paymentReference - The new payment reference
 * @param param.requestSource - The request source
 * @returns The modified report
 */
export const handleUtilisationReportEditPaymentEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, payment, feeRecords, paymentAmount, datePaymentReceived, paymentReference, requestSource }: EditPayloadEventPayload,
): Promise<UtilisationReportEntity> => {
  payment.update({
    amount: paymentAmount,
    dateReceived: datePaymentReceived,
    reference: paymentReference,
    requestSource,
  });
  await transactionEntityManager.save(PaymentEntity, payment);

  const feeRecordsAndPaymentsMatch = await feeRecordsMatchAttachedPayments(feeRecords, transactionEntityManager);

  const feeRecordStateMachines = feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'PAYMENT_EDITED',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch,
          requestSource,
        },
      }),
    ),
  );

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
