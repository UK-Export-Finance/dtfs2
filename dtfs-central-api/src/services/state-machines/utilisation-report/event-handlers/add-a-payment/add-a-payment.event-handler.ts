import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FeeRecordEntity,
  PENDING_RECONCILIATION,
  PaymentEntity,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntity,
} from '@ukef/dtfs2-common';
import { NewPaymentDetails } from '../../../../../types/utilisation-reports';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type AddAPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecords: FeeRecordEntity[];
  paymentDetails: NewPaymentDetails;
  requestSource: DbRequestSource;
};

export type UtilisationReportAddAPaymentEvent = BaseUtilisationReportEvent<typeof UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT, AddAPaymentEventPayload>;

/**
 * Handler for the add a payment event
 * @param report - The report
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecords - The fee records
 * @param param.paymentDetails - The payment details
 * @param param.requestSource - The request source
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

  for (const stateMachine of feeRecordStateMachines) {
    await stateMachine.handleEvent({
      type: 'PAYMENT_ADDED',
      payload: {
        transactionEntityManager,
        feeRecordsAndPaymentsMatch,
        requestSource,
      },
    });
  }

  if (report.status === PENDING_RECONCILIATION) {
    report.updateWithStatus({ status: RECONCILIATION_IN_PROGRESS, requestSource });
  } else {
    report.updateLastUpdatedBy(requestSource);
  }
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
