import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

type RemoveFeesFromPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  selectedFeeRecords: FeeRecordEntity[];
  otherFeeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportRemoveFeesFromPaymentEvent = BaseUtilisationReportEvent<'REMOVE_PAYMENT_FEES', RemoveFeesFromPaymentEventPayload>;

const removeSelectedFeePayments = async (transactionEntityManager: EntityManager, feeRecords: FeeRecordEntity[], requestSource: DbRequestSource) => {
  const feeRecordStateMachines = feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'REMOVE_FROM_PAYMENT_GROUP',
        payload: {
          transactionEntityManager,
          requestSource,
        },
      }),
    ),
  );
};

const updateOtherFeePaymentsInGroup = async (transactionEntityManager: EntityManager, feeRecords: FeeRecordEntity[], requestSource: DbRequestSource) => {
  const feeRecordsAndPaymentsMatch = await feeRecordsMatchAttachedPayments(feeRecords, transactionEntityManager);

  const feeRecordStateMachines = feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    feeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'OTHER_FEE_REMOVED_FROM_GROUP',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch,
          requestSource,
        },
      }),
    ),
  );
};

export const handleUtilisationReportRemoveFeesFromPaymentEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, selectedFeeRecords, otherFeeRecords, requestSource }: RemoveFeesFromPaymentEventPayload,
): Promise<UtilisationReportEntity> => {
  await removeSelectedFeePayments(transactionEntityManager, selectedFeeRecords, requestSource);
  await updateOtherFeePaymentsInGroup(transactionEntityManager, otherFeeRecords, requestSource);

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
