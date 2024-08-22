import { EntityManager, In } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordPaymentJoinTableEntity, FeeRecordStatus, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { KeyingSheetFeePaymentShare, getKeyingSheetFeePaymentSharesForFeeRecords } from '../helpers';

const getFacilityIdsAtToDoOrDoesNotMatchStatus = async (entityManager: EntityManager, reportId: number): Promise<Set<string>> => {
  const feeRecordsAtToDoOrDoesNotMatchStatus = await entityManager.find(FeeRecordEntity, {
    where: {
      report: { id: reportId },
      status: In<FeeRecordStatus>(['TO_DO', 'DOES_NOT_MATCH']),
    },
  });
  return feeRecordsAtToDoOrDoesNotMatchStatus.reduce((facilityIds, { facilityId }) => facilityIds.add(facilityId), new Set<string>());
};

const updateFeeRecordPaymentJoinTableWithKeyingSheetFeePaymentShares = async (
  KeyingSheetFeePaymentShares: KeyingSheetFeePaymentShare[],
  entityManager: EntityManager,
): Promise<void> => {
  await Promise.all(
    KeyingSheetFeePaymentShares.map(({ feeRecordId, paymentId, feePaymentAmount }) =>
      entityManager.update(FeeRecordPaymentJoinTableEntity, { feeRecordId, paymentId }, { paymentAmountUsedForFeeRecord: feePaymentAmount }).catch((error) => {
        console.error(`Failed to update fee record payment join table for fee record id '${feeRecordId}' and payment id '${paymentId}'`);
        throw error;
      }),
    ),
  );
};

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAtMatchStatusWithPayments: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportGenerateKeyingDataEvent = BaseUtilisationReportEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

export const handleUtilisationReportGenerateKeyingDataEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecordsAtMatchStatusWithPayments, requestSource }: GenerateKeyingDataEventPayload,
): Promise<UtilisationReportEntity> => {
  const finalFeeRecordFacilityIds = await getFacilityIdsAtToDoOrDoesNotMatchStatus(transactionEntityManager, report.id);

  const { reportPeriod } = report;
  const feeRecordsWithPayloads = feeRecordsAtMatchStatusWithPayments.map((feeRecord) => {
    const { facilityId } = feeRecord;

    if (finalFeeRecordFacilityIds.has(facilityId)) {
      return {
        feeRecord,
        payload: { transactionEntityManager, isFinalFeeRecordForFacility: false, reportPeriod, requestSource },
      };
    }

    finalFeeRecordFacilityIds.add(facilityId);
    return {
      feeRecord,
      payload: { transactionEntityManager, isFinalFeeRecordForFacility: true, reportPeriod, requestSource },
    };
  });

  await Promise.all(
    feeRecordsWithPayloads.map(async ({ feeRecord, payload }) => {
      const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);
      return stateMachine.handleEvent({
        type: 'GENERATE_KEYING_DATA',
        payload,
      });
    }),
  );

  const KeyingSheetFeePaymentShares = getKeyingSheetFeePaymentSharesForFeeRecords(feeRecordsAtMatchStatusWithPayments);
  await updateFeeRecordPaymentJoinTableWithKeyingSheetFeePaymentShares(KeyingSheetFeePaymentShares, transactionEntityManager);

  if (report.status === 'PENDING_RECONCILIATION') {
    report.updateWithStatus({ status: 'RECONCILIATION_IN_PROGRESS', requestSource });
  } else {
    report.updateLastUpdatedBy(requestSource);
  }
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
