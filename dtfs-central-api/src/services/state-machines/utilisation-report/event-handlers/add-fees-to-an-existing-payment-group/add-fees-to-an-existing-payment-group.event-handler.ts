import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

type AddFeesToAnExistingPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsToAdd: FeeRecordEntity[];
  otherFeeRecordsInPaymentGroup: FeeRecordEntity[];
  payments: PaymentEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportAddFeesToAnExistingPaymentGroupEvent = BaseUtilisationReportEvent<
  'ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP',
  AddFeesToAnExistingPaymentGroupEventPayload
>;

const addSelectedFeeRecordsToPaymentGroup = async (
  transactionEntityManager: EntityManager,
  feeRecords: FeeRecordEntity[],
  payments: PaymentEntity[],
  requestSource: DbRequestSource,
) => {
  await Promise.all(
    payments.map(async (payment) => {
      payment.addFeeRecords({
        feeRecords,
        requestSource,
      });
      await transactionEntityManager.save(PaymentEntity, payment);
    }),
  );

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
};

const updateOtherFeeRecordsInPaymentGroup = async (transactionEntityManager: EntityManager, feeRecords: FeeRecordEntity[], requestSource: DbRequestSource) => {
  const feeRecordsAndPaymentsMatch = await feeRecordsMatchAttachedPayments(feeRecords, transactionEntityManager);

  const feeRecordStateMachines = feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'OTHER_FEE_RECORD_ADDED_TO_PAYMENT_GROUP',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch,
          requestSource,
        },
      }),
    ),
  );
};

export const handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecordsToAdd, otherFeeRecordsInPaymentGroup, payments, requestSource }: AddFeesToAnExistingPaymentGroupEventPayload,
): Promise<UtilisationReportEntity> => {
  await addSelectedFeeRecordsToPaymentGroup(transactionEntityManager, feeRecordsToAdd, payments, requestSource);
  await updateOtherFeeRecordsInPaymentGroup(transactionEntityManager, otherFeeRecordsInPaymentGroup, requestSource);

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
