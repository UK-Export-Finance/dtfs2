import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NewPaymentDetails } from '../../../../../types/utilisation-reports';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

type AddAPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecords: FeeRecordEntity[];
  paymentDetails: NewPaymentDetails;
  requestSource: DbRequestSource;
};

export type UtilisationReportAddAPaymentEvent = BaseUtilisationReportEvent<'ADD_A_PAYMENT', AddAPaymentEventPayload>;

/**
 * Handler for the add a payment event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportAddAPaymentEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecords, paymentDetails, requestSource }: AddAPaymentEventPayload,
): Promise<UtilisationReportEntity> => {
  const payment = PaymentEntity.create({
    ...paymentDetails,
    feeRecords,
    requestSource,
  });
  await transactionEntityManager.save(PaymentEntity, payment);

  const feeRecordsAndPaymentsMatch = await feeRecordsMatchAttachedPayments(feeRecords, transactionEntityManager);

  const feeRecordStateMachines = feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'PAYMENT_ADDED',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch,
          requestSource,
        },
      }),
    ),
  );

  if (report.status === 'PENDING_RECONCILIATION') {
    report.updateWithStatus({ status: 'RECONCILIATION_IN_PROGRESS', requestSource });
  } else {
    report.updateLastUpdatedBy(requestSource);
  }
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
