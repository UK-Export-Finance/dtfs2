import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

type RemoveFeesFromPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsToRemove: FeeRecordEntity[];
  otherFeeRecordsInGroup: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportRemoveFeesFromPaymentGroupEvent = BaseUtilisationReportEvent<
  'REMOVE_FEES_FROM_PAYMENT_GROUP',
  RemoveFeesFromPaymentGroupEventPayload
>;

const removeSelectedFeePaymentsFromGroup = async (transactionEntityManager: EntityManager, feeRecords: FeeRecordEntity[], requestSource: DbRequestSource) => {
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
        type: 'OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP',
        payload: {
          transactionEntityManager,
          feeRecordsAndPaymentsMatch,
          requestSource,
        },
      }),
    ),
  );
};

export const handleUtilisationReportRemoveFeesFromPaymentGroupEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecordsToRemove, otherFeeRecordsInGroup, requestSource }: RemoveFeesFromPaymentGroupEventPayload,
): Promise<UtilisationReportEntity> => {
  await removeSelectedFeePaymentsFromGroup(transactionEntityManager, feeRecordsToRemove, requestSource);
  await updateOtherFeePaymentsInGroup(transactionEntityManager, otherFeeRecordsInGroup, requestSource);

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
