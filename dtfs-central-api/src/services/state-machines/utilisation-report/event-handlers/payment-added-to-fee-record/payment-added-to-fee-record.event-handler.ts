import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NewPaymentDetails } from '../../../../../types/utilisation-reports';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from './helpers';

type PaymentAddedToFeeRecordEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecords: FeeRecordEntity[];
  paymentDetails: NewPaymentDetails;
  requestSource: DbRequestSource;
};

export type UtilisationReportPaymentAddedToFeeRecordEvent = BaseUtilisationReportEvent<'PAYMENT_ADDED_TO_FEE_RECORD', PaymentAddedToFeeRecordEventPayload>;

export const handleUtilisationReportPaymentAddedToFeeRecordEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecords, paymentDetails, requestSource }: PaymentAddedToFeeRecordEventPayload,
): Promise<UtilisationReportEntity> => {
  const payment = PaymentEntity.create({
    ...paymentDetails,
    feeRecords,
    requestSource,
  });
  await transactionEntityManager.save(PaymentEntity, payment);

  const feeRecordStatusToSet: FeeRecordStatus = (await feeRecordsMatchAttachedPayments(feeRecords, transactionEntityManager)) ? 'MATCH' : 'DOES_NOT_MATCH';

  const feeRecordStateMachines = feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'ADD_A_PAYMENT',
        payload: {
          transactionEntityManager,
          status: feeRecordStatusToSet,
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
