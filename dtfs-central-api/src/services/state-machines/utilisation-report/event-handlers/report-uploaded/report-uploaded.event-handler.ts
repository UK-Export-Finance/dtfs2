import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  UtilisationReportEntity,
  AzureFileInfo,
  AzureFileInfoEntity,
  FeeRecordEntity,
  FacilityUtilisationDataEntity,
  ReportPeriod,
} from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { feeRecordCsvRowToSqlEntity } from '../../../../../helpers';

type ReportUploadedEventPayload = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

const createFacilityUtilisationDataEntityIfNotExists = async (
  facilityId: string,
  reportPeriod: ReportPeriod,
  requestSource: DbRequestSource,
  entityManager: EntityManager,
): Promise<FacilityUtilisationDataEntity | null> => {
  const entityExists = await entityManager.existsBy(FacilityUtilisationDataEntity, { id: facilityId });
  if (entityExists) {
    return null;
  }
  return FacilityUtilisationDataEntity.createWithoutUtilisationAndFixedFee({ id: facilityId, reportPeriod, requestSource });
};

export type UtilisationReportReportUploadedEvent = BaseUtilisationReportEvent<'REPORT_UPLOADED', ReportUploadedEventPayload>;
/**
 * Handler for the utilisation report "report uploaded" event
 * @param report - The report to update
 * @param param1 - The payload for the event
 * @returns The updated report
 */
export const handleUtilisationReportReportUploadedEvent = async (
  report: UtilisationReportEntity,
  { azureFileInfo, reportCsvData, uploadedByUserId, requestSource, transactionEntityManager }: ReportUploadedEventPayload,
): Promise<UtilisationReportEntity> => {
  const azureFileInfoEntity = AzureFileInfoEntity.create({
    ...azureFileInfo,
    requestSource,
  });
  report.updateWithUploadDetails({
    azureFileInfo: azureFileInfoEntity,
    uploadedByUserId,
    requestSource,
  });
  await transactionEntityManager.save(UtilisationReportEntity, report);

  const uniqueReportCsvDataFacilityIds: string[] = Array.from(
    reportCsvData.reduce((uniqueFacilityIds, { 'ukef facility id': facilityId }) => uniqueFacilityIds.add(facilityId), new Set<string>()),
  );
  const facilityUtilisationDataEntities = await Promise.all(
    uniqueReportCsvDataFacilityIds.map((facilityId) =>
      createFacilityUtilisationDataEntityIfNotExists(facilityId, report.reportPeriod, requestSource, transactionEntityManager),
    ),
  );
  await transactionEntityManager.save(
    FacilityUtilisationDataEntity,
    facilityUtilisationDataEntities.filter((entity): entity is FacilityUtilisationDataEntity => entity !== null),
  );

  const feeRecordEntities: FeeRecordEntity[] = reportCsvData.map((dataEntry) =>
    feeRecordCsvRowToSqlEntity({
      dataEntry,
      requestSource,
      report,
    }),
  );
  await transactionEntityManager.save(FeeRecordEntity, feeRecordEntities, { chunk: 100 });
  report.updateWithFeeRecords({
    feeRecords: feeRecordEntities,
  });

  return report;
};
