import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity, AzureFileInfo, AzureFileInfoEntity, FeeRecordEntity, UtilisationReportRawCsvData } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { feeRecordCsvRowToSqlEntity } from '../../../../../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';
import { CHUNK_SIZE_FOR_SQL_BATCH_SAVING } from '../../../../../constants';
import { FacilityUtilisationDataService } from '../../../../facility-utilisation-data/facility-utilisation-data.service';

type ReportUploadedEventPayload = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportReportUploadedEvent = BaseUtilisationReportEvent<typeof UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED, ReportUploadedEventPayload>;

/**
 * Handler for the report uploaded event
 * @param report - The report
 * @param param - The payload
 * @param param.azureFileInfo - The azure file info
 * @param param.reportCsvData - The report CSV data
 * @param param.uploadedByUserId - The id of the user uploading the report
 * @param param.requestSource - The request source
 * @param param.transactionEntityManager - The transaction entity manager
 * @returns The modified report
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

  const uniqueReportCsvDataFacilityIds = reportCsvData.reduce(
    (uniqueFacilityIds, { 'ukef facility id': facilityId }) => uniqueFacilityIds.add(facilityId),
    new Set<string>(),
  );

  await FacilityUtilisationDataService.initialiseFacilityUtilisationData(
    uniqueReportCsvDataFacilityIds,
    report.bankId,
    report.reportPeriod,
    requestSource,
    transactionEntityManager,
  );

  const feeRecordEntities: FeeRecordEntity[] = reportCsvData.map((dataEntry) =>
    feeRecordCsvRowToSqlEntity({
      dataEntry,
      requestSource,
      report,
    }),
  );

  await transactionEntityManager.save(FeeRecordEntity, feeRecordEntities, { chunk: CHUNK_SIZE_FOR_SQL_BATCH_SAVING });
  report.updateWithFeeRecords({
    feeRecords: feeRecordEntities,
  });

  return report;
};
