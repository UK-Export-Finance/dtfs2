import { EntityManager, In } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, FeeRecordStatus, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

const getFacilityIdsWhereKeyingDataCannotBeCalculated = async (entityManager: EntityManager, reportId: number): Promise<Set<string>> => {
  const feeRecordsWhereKeyingDataCannotBeCalculated = await entityManager.find(FeeRecordEntity, {
    where: {
      report: { id: reportId },
      status: In<FeeRecordStatus>(['TO_DO', 'DOES_NOT_MATCH']),
    },
  });
  return feeRecordsWhereKeyingDataCannotBeCalculated.reduce((facilityIds, { facilityId }) => facilityIds.add(facilityId), new Set<string>());
};

type GenerateKeyingDataEventPayload = {
  transactionEntityManager: EntityManager;
  matchFeeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportGenerateKeyingDataEvent = BaseUtilisationReportEvent<'GENERATE_KEYING_DATA', GenerateKeyingDataEventPayload>;

export const handleUtilisationReportGenerateKeyingDataEvent = async (
  report: UtilisationReportEntity,
  { transactionEntityManager, matchFeeRecords, requestSource }: GenerateKeyingDataEventPayload,
): Promise<UtilisationReportEntity> => {
  const facilityIdsWhereKeyingDataCannotBeCalculated = await getFacilityIdsWhereKeyingDataCannotBeCalculated(transactionEntityManager, report.id);
  const processedFacilityIds = new Set<string>();

  await Promise.all(
    matchFeeRecords.map((feeRecord) => {
      const { facilityId } = feeRecord;
      const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

      if (processedFacilityIds.has(facilityId)) {
        return stateMachine.handleEvent({
          type: 'GENERATE_KEYING_DATA',
          payload: {
            transactionEntityManager,
            isFinalFeeRecordForFacility: false,
            requestSource,
          },
        });
      }

      processedFacilityIds.add(facilityId);
      return stateMachine.handleEvent({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager,
          isFinalFeeRecordForFacility: !facilityIdsWhereKeyingDataCannotBeCalculated.has(facilityId),
          requestSource,
        },
      });
    }),
  );

  report.updateLastUpdatedBy(requestSource);
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};
