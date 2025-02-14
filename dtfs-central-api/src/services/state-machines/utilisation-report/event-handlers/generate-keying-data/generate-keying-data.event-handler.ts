import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FeeRecordEntity,
  FeeRecordPaymentJoinTableEntity,
  PENDING_RECONCILIATION,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntity,
} from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { KeyingSheetFeePaymentShare, getKeyingSheetFeePaymentSharesForFeeRecords } from '../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

/**
 * Updates the fee record payment join table with the supplied keying sheet fee payment shares
 * @param keyingSheetFeePaymentShares - The keying sheet fee payment shares
 * @param entityManager - The entity manager
 */
const updateFeeRecordPaymentJoinTable = async (keyingSheetFeePaymentShares: KeyingSheetFeePaymentShare[], entityManager: EntityManager): Promise<void> => {
  for (const { feeRecordId, paymentId, feePaymentAmount } of keyingSheetFeePaymentShares) {
    await entityManager
      .update(FeeRecordPaymentJoinTableEntity, { feeRecordId, paymentId }, { paymentAmountUsedForFeeRecord: feePaymentAmount })
      .catch((error) => {
        console.error(`Failed to update fee record payment join table for fee record id '%s' and payment id '%s'`, feeRecordId, paymentId);
        throw error;
      });
  }
};

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAtMatchStatusWithPayments: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportGenerateKeyingDataEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA,
  GenerateKeyingDataEventPayload
>;

/**
 * Handler for the generate keying data event
 * @param report - The report
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @param param.feeRecordsAtMatchStatusWithPayments - The fee records at MATCH status with payments
 * @returns The modified report
 */
export const handleUtilisationReportGenerateKeyingDataEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecordsAtMatchStatusWithPayments, requestSource }: GenerateKeyingDataEventPayload,
): Promise<UtilisationReportEntity> => {
  for (const feeRecord of feeRecordsAtMatchStatusWithPayments) {
    const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

    await stateMachine.handleEvent({
      type: 'GENERATE_KEYING_DATA',
      payload: { transactionEntityManager, requestSource },
    });
  }

  const KeyingSheetFeePaymentShares = getKeyingSheetFeePaymentSharesForFeeRecords(feeRecordsAtMatchStatusWithPayments);
  await updateFeeRecordPaymentJoinTable(KeyingSheetFeePaymentShares, transactionEntityManager);

  if (report.status === PENDING_RECONCILIATION) {
    report.updateWithStatus({ status: RECONCILIATION_IN_PROGRESS, requestSource });
  } else {
    report.updateLastUpdatedBy(requestSource);
  }
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
