import { EntityManager, In } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

const getFacilityIdsAtToDoOrDoesNotMatchStatus = async (entityManager: EntityManager, reportId: number): Promise<Set<string>> => {
  const feeRecordsAtToDoOrDoesNotMatchStatus = await entityManager.find(FeeRecordEntity, {
    where: {
      report: { id: reportId },
      status: In<FeeRecordStatus>(['TO_DO', 'DOES_NOT_MATCH']),
    },
  });
  return feeRecordsAtToDoOrDoesNotMatchStatus.reduce((facilityIds, { facilityId }) => facilityIds.add(facilityId), new Set<string>());
};

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  feeRecordsAtMatchStatus: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportGenerateKeyingDataEvent = BaseUtilisationReportEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

export const handleUtilisationReportGenerateKeyingDataEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, feeRecordsAtMatchStatus, requestSource }: GenerateKeyingDataEventPayload,
): Promise<UtilisationReportEntity> => {
  const finalFeeRecordFacilityIds = await getFacilityIdsAtToDoOrDoesNotMatchStatus(transactionEntityManager, report.id);

  const { reportPeriod } = report;
  const feeRecordsWithPayloads = feeRecordsAtMatchStatus.map((feeRecord) => {
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
    feeRecordsWithPayloads.map(({ feeRecord, payload }) => {
      const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);
      return stateMachine.handleEvent({
        type: 'GENERATE_KEYING_DATA',
        payload,
      });
    }),
  );

  if (report.status === 'PENDING_RECONCILIATION') {
    report.updateWithStatus({ status: 'RECONCILIATION_IN_PROGRESS', requestSource });
  } else {
    report.updateLastUpdatedBy(requestSource);
  }
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
