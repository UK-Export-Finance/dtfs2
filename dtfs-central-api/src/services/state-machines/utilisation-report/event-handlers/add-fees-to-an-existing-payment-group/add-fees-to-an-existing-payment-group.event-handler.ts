import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type AddFeesToAnExistingPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsToAdd: FeeRecordEntity[];
  existingFeeRecordsInPaymentGroup: FeeRecordEntity[];
  payments: PaymentEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportAddFeesToAnExistingPaymentGroupEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP,
  AddFeesToAnExistingPaymentGroupEventPayload
>;

/**
 * Adds the selected fee records to the payment group
 * @param transactionEntityManager - The entity manager
 * @param feeRecordsToAdd - The fee records to add
 * @param feeRecordsAndPaymentsMatch - Whether or not the fee records match the payments
 * @param payments - The payments
 * @param requestSource - The request source
 */
const addSelectedFeeRecordsToPaymentGroup = async (
  transactionEntityManager: EntityManager,
  feeRecordsToAdd: FeeRecordEntity[],
  feeRecordsAndPaymentsMatch: boolean,
  payments: PaymentEntity[],
  requestSource: DbRequestSource,
): Promise<void> => {
  for (const payment of payments) {
    payment.updateWithAdditionalFeeRecords({
      additionalFeeRecords: feeRecordsToAdd,
      requestSource,
    });
    await transactionEntityManager.save(PaymentEntity, payment);
  }

  const feeRecordStateMachines = feeRecordsToAdd.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));

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
};

/**
 * Updates the existing fee records in the payment group
 * @param transactionEntityManager - The entity manager
 * @param feeRecordsToUpdate - The fee records to update
 * @param feeRecordsAndPaymentsMatch - Whether or not the fee records match the payments
 * @param requestSource - The request source
 */
const updateExistingFeeRecordsInPaymentGroup = async (
  transactionEntityManager: EntityManager,
  feeRecordsToUpdate: FeeRecordEntity[],
  feeRecordsAndPaymentsMatch: boolean,
  requestSource: DbRequestSource,
): Promise<void> => {
  const feeRecordStateMachines = feeRecordsToUpdate.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));

  for (const stateMachine of feeRecordStateMachines) {
    await stateMachine.handleEvent({
      type: 'OTHER_FEE_ADDED_TO_PAYMENT_GROUP',
      payload: {
        transactionEntityManager,
        feeRecordsAndPaymentsMatch,
        requestSource,
      },
    });
  }
};

/**
 * Handler for the add fees to an existing payment group event
 * @param report - The report
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsToAdd - The fee records to add
 * @param param.existingFeeRecordsInPaymentGroup - The existing fee records in the payment group
 * @param param.payments - The payments
 * @param param.requestSource - The request source
 * @returns The modified report
 */
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
