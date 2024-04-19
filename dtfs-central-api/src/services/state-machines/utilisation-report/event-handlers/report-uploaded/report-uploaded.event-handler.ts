import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity, AzureFileInfo, AzureFileInfoEntity, FeeRecordEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
// import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { feeRecordCsvRowToSqlEntity } from '../../../../../helpers';

type ReportUploadedEventPayload = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
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

  const feeRecordEntities: FeeRecordEntity[] = reportCsvData.map((dataEntry) =>
    feeRecordCsvRowToSqlEntity({
      dataEntry,
      requestSource,
      report,
    }),
  );

  await transactionEntityManager.save(FeeRecordEntity, feeRecordEntities, { chunk: 100 });
  report.feeRecords = feeRecordEntities;
  return report;
};
