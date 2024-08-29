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

/**
 * Removes the selected fee records from the group
 * @param transactionEntityManager - The entity manager
 * @param feeRecords - The fee records
 * @param requestSource - The request source
 */
const removeSelectedFeeRecordsFromGroup = async (
  transactionEntityManager: EntityManager,
  feeRecords: FeeRecordEntity[],
  requestSource: DbRequestSource,
): Promise<void> => {
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

/**
 * Updates the supplied remaining fee records
 * @param transactionEntityManager - The entity manager
 * @param feeRecords - The fee records
 * @param requestSource - The request source
 */
const updateRemainingFeeRecords = async (
  transactionEntityManager: EntityManager,
  feeRecords: FeeRecordEntity[],
  requestSource: DbRequestSource,
): Promise<void> => {
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

/**
 * Handler for the remove fees from payment group event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportRemoveFeesFromPaymentGroupEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecordsToRemove, otherFeeRecordsInGroup, requestSource }: RemoveFeesFromPaymentGroupEventPayload,
): Promise<UtilisationReportEntity> => {
  await removeSelectedFeeRecordsFromGroup(transactionEntityManager, feeRecordsToRemove, requestSource);
  await updateRemainingFeeRecords(transactionEntityManager, otherFeeRecordsInGroup, requestSource);

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
