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
import { calculateInitialUtilisationAndFixedFee } from '../helpers';

type ReportUploadedEventPayload = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

/**
 * Creates a new facility utilisation data entity by id if an entity does not exist
 * if it does not exist:
 * calculates the initial utilisation and fixed fee
 * creates a new facility utilisation data entity with the calculated values
 * @param facilityId - The facility id
 * @param reportPeriod - The report period
 * @param requestSource - The request source
 * @param entityManager - The entity manager
 * @returns The new facility utilisation data entity
 */
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

  const { utilisation, fixedFee } = await calculateInitialUtilisationAndFixedFee(facilityId);

  return FacilityUtilisationDataEntity.create({
    id: facilityId,
    reportPeriod,
    requestSource,
    utilisation,
    fixedFee,
  });
};

const CHUNK_SIZE_FOR_BATCH_SAVING = 100;

export type UtilisationReportReportUploadedEvent = BaseUtilisationReportEvent<'REPORT_UPLOADED', ReportUploadedEventPayload>;

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
    { chunk: CHUNK_SIZE_FOR_BATCH_SAVING },
  );

  const feeRecordEntities: FeeRecordEntity[] = reportCsvData.map((dataEntry) =>
    feeRecordCsvRowToSqlEntity({
      dataEntry,
      requestSource,
      report,
    }),
  );
  await transactionEntityManager.save(FeeRecordEntity, feeRecordEntities, { chunk: CHUNK_SIZE_FOR_BATCH_SAVING });
  report.updateWithFeeRecords({
    feeRecords: feeRecordEntities,
  });

  return report;
};
