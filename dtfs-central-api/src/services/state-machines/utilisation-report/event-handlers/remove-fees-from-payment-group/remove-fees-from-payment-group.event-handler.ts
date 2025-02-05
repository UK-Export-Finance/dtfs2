import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';
import { FEE_RECORD_EVENT_TYPE } from '../../../fee-record/event/fee-record.event-type';

type RemoveFeesFromPaymentGroupEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsToRemove: FeeRecordEntity[];
  otherFeeRecordsInGroup: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportRemoveFeesFromPaymentGroupEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.REMOVE_FEES_FROM_PAYMENT_GROUP,
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
  for (const feeRecord of feeRecords) {
    const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

    await stateMachine.handleEvent({
      type: FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP,
      payload: {
        transactionEntityManager,
        requestSource,
      },
    });
  }
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

  for (const feeRecord of feeRecords) {
    const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

    await stateMachine.handleEvent({
      type: FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP,
      payload: {
        transactionEntityManager,
        feeRecordsAndPaymentsMatch,
        requestSource,
      },
    });
  }
};

/**
 * Handler for the remove fees from payment group event
 * @param report - The report
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.feeRecordsToRemove - The fee records to remove
 * @param param.otherFeeRecordsInGroup - The other fee records in the group
 * @param param.requestSource - The request source
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
