import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

type AddFeesToAnExistingPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsToAdd: FeeRecordEntity[];
  existingFeeRecordsInPaymentGroup: FeeRecordEntity[];
  payments: PaymentEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportAddFeesToAnExistingPaymentGroupEvent = BaseUtilisationReportEvent<
  'ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP',
  AddFeesToAnExistingPaymentGroupEventPayload
>;

const addSelectedFeeRecordsToPaymentGroup = async (
  transactionEntityManager: EntityManager,
  feeRecordsToAdd: FeeRecordEntity[],
  feeRecordsAndPaymentsMatch: boolean,
  payments: PaymentEntity[],
  requestSource: DbRequestSource,
) => {
  await Promise.all(
    payments.map(async (payment) => {
      payment.updateWithAdditionalFeeRecords({
        additionalFeeRecords: feeRecordsToAdd,
        requestSource,
      });
      await transactionEntityManager.save(PaymentEntity, payment);
    }),
  );

  const feeRecordStateMachines = feeRecordsToAdd.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
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

const updateExistingFeeRecordsInPaymentGroup = async (
  transactionEntityManager: EntityManager,
  feeRecordsToUpdate: FeeRecordEntity[],
  feeRecordsAndPaymentsMatch: boolean,
  requestSource: DbRequestSource,
) => {
  const feeRecordStateMachines = feeRecordsToUpdate.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'OTHER_FEE_ADDED_TO_PAYMENT_GROUP',
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
  { transactionEntityManager, feeRecordsToAdd, existingFeeRecordsInPaymentGroup, payments, requestSource }: AddFeesToAnExistingPaymentGroupEventPayload,
): Promise<UtilisationReportEntity> => {
  const allFeeRecords = [...existingFeeRecordsInPaymentGroup, ...feeRecordsToAdd];
  const feeRecordsAndPaymentsMatchAfterFeeRecordsAdded = await feeRecordsMatchAttachedPayments(allFeeRecords, transactionEntityManager);

  await addSelectedFeeRecordsToPaymentGroup(transactionEntityManager, feeRecordsToAdd, feeRecordsAndPaymentsMatchAfterFeeRecordsAdded, payments, requestSource);
  await updateExistingFeeRecordsInPaymentGroup(
    transactionEntityManager,
    existingFeeRecordsInPaymentGroup,
    feeRecordsAndPaymentsMatchAfterFeeRecordsAdded,
    requestSource,
  );

  return report;
};
