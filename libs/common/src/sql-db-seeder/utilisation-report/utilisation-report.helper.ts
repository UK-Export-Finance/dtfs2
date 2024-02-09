import { AzureFileInfoEntity, SafeExclude, UtilisationReportEntity, UtilisationReportReconciliationStatus } from '../..';
import { PortalUser, TfmUser } from '../../types/mongo-db-models';
import { getDbAuditUpdatedByUserId } from '../../sql-db-entities/helpers';
import { ReportPeriodPartialEntity } from '../../sql-db-entities/partial-entities';
import { MOCK_AZURE_FILE_INFO } from '../../test-helpers/mock-data';

/**
 * Generates a report in a not received state, effectively mocking the scheduled
 * job which generates reports
 * @param bankId - The bank id
 * @param reportPeriod - The report period
 * @returns The utilisation report entity to insert
 */
export const createNotReceivedReport = (bankId: string, reportPeriod: ReportPeriodPartialEntity): UtilisationReportEntity =>
  UtilisationReportEntity.createNotReceived({
    bankId,
    reportPeriod,
    requestSource: {
      platform: 'SYSTEM',
    },
  });

/**
 * Generates a utilisation report which has been marked as completed
 * by a tfm user
 * @param bankId - The bank id
 * @param tfmUser - The TFM user who marked the report as completed
 * @param reportPeriod - The report period
 * @param status - The status (should be any status except 'REPORT_NOT_RECEIVED')
 * @returns The utilisation report entity to insert
 */
export const createMarkedAsCompletedReport = (
  bankId: string,
  tfmUser: TfmUser,
  reportPeriod: ReportPeriodPartialEntity,
  status: SafeExclude<UtilisationReportReconciliationStatus, 'REPORT_NOT_RECEIVED'>,
): UtilisationReportEntity => {
  const utilisationReport = new UtilisationReportEntity();

  // Bank ids are unique and will make it easier to link the report to utilisation data (as long as we have one report per bank)
  utilisationReport.id = Number(bankId);

  utilisationReport.bankId = bankId;
  utilisationReport.reportPeriod = reportPeriod;
  utilisationReport.status = status;
  utilisationReport.dateUploaded = new Date();
  utilisationReport.uploadedByUserId = null;
  utilisationReport.updatedByUserId = getDbAuditUpdatedByUserId({ platform: 'TFM', userId: tfmUser._id.toString() });

  return utilisationReport;
};

/**
 * Generates an uploaded utilisation report
 * @param portalUser - The portal user who uploaded the report
 * @param reportPeriod - The report period
 * @param status - The status (should be any status except 'REPORT_NOT_RECEIVED')
 * @returns The utilisation report with a defined `azureFileInfo` property
 */
export const createUploadedReport = (
  portalUser: PortalUser,
  reportPeriod: ReportPeriodPartialEntity,
  status: SafeExclude<UtilisationReportReconciliationStatus, 'REPORT_NOT_RECEIVED'>,
): UtilisationReportEntity => {
  const utilisationReport = new UtilisationReportEntity();

  // Bank ids are unique and will make it easier to link the report to utilisation data (as long as we have one report per bank)
  const { id: bankId } = portalUser.bank;
  utilisationReport.id = Number(bankId);

  utilisationReport.bankId = bankId;
  utilisationReport.reportPeriod = reportPeriod;
  utilisationReport.status = status;
  utilisationReport.dateUploaded = new Date();
  utilisationReport.uploadedByUserId = null;
  utilisationReport.updatedByUserId = getDbAuditUpdatedByUserId({ platform: 'TFM', userId: portalUser._id.toString() });

  const azureFileInfo = new AzureFileInfoEntity();

  azureFileInfo.folder = MOCK_AZURE_FILE_INFO.folder;
  azureFileInfo.filename = MOCK_AZURE_FILE_INFO.filename;
  azureFileInfo.fullPath = MOCK_AZURE_FILE_INFO.fullPath;
  azureFileInfo.url = MOCK_AZURE_FILE_INFO.url;
  azureFileInfo.mimetype = MOCK_AZURE_FILE_INFO.mimetype;

  azureFileInfo.updatedByUserId = utilisationReport.updatedByUserId;

  utilisationReport.azureFileInfo = azureFileInfo;

  return utilisationReport;
};
