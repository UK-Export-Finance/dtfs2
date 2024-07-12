import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  UtilisationReportEntity,
  AzureFileInfo,
  AzureFileInfoEntity,
  FeeRecordEntity,
  FacilityUtilisationDataEntity,
} from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { feeRecordCsvRowToSqlEntity } from '../../../../../helpers';
import { NotFoundError } from '../../../../../errors';

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

  const reportCsvDataFacilityIds = reportCsvData.map(({ 'ukef facility id': facilityId }) => facilityId);
  const allReportCsvDataFacilityIdsExist = (
    await Promise.all(reportCsvDataFacilityIds.map((facilityId) => transactionEntityManager.existsBy(FacilityUtilisationDataEntity, { id: facilityId })))
  ).every((facilityIdExists) => facilityIdExists);
  if (!allReportCsvDataFacilityIdsExist) {
    throw new NotFoundError('Failed to find a facility utilisation data row for the facility ids listed in the report');
  }

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
