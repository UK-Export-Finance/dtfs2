import {
  AzureFileInfoEntity,
  SafeExclude,
  UtilisationReportEntity,
  UtilisationReportReconciliationStatus,
  MOCK_AZURE_FILE_INFO,
  PortalUser,
  TfmUser,
  ReportPeriod,
  DbRequestSource,
  FeeRecordEntity,
} from '@ukef/dtfs2-common';
import { createFeeRecord } from '../fee-record/fee-record.helper';

/**
 * Generates a report in a not received state, effectively mocking the scheduled
 * job which generates reports
 * @param bankId - The bank id
 * @param reportPeriod - The report period
 * @returns The utilisation report entity to insert
 */
export const createNotReceivedReport = (bankId: string, reportPeriod: ReportPeriod): UtilisationReportEntity =>
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
  reportPeriod: ReportPeriod,
  status: SafeExclude<UtilisationReportReconciliationStatus, 'REPORT_NOT_RECEIVED'>,
): UtilisationReportEntity => {
  const utilisationReport = new UtilisationReportEntity();

  // Bank ids are unique and will make it easier to link the report to fee record (as long as we have one report per bank)
  utilisationReport.id = Number(bankId);

  utilisationReport.bankId = bankId;
  utilisationReport.reportPeriod = reportPeriod;
  utilisationReport.status = status;
  utilisationReport.dateUploaded = new Date();
  utilisationReport.uploadedByUserId = null;
  utilisationReport.updateLastUpdatedBy({ platform: 'TFM', userId: tfmUser._id.toString() });

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
  reportPeriod: ReportPeriod,
  status: SafeExclude<UtilisationReportReconciliationStatus, 'REPORT_NOT_RECEIVED'>,
): UtilisationReportEntity => {
  const utilisationReport = new UtilisationReportEntity();

  // Bank ids are unique and will make it easier to link the report to fee record (as long as we have one report per bank)
  const { id: bankId } = portalUser.bank;
  utilisationReport.id = Number(bankId);

  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: portalUser._id.toString(),
  };

  utilisationReport.bankId = bankId;
  utilisationReport.reportPeriod = reportPeriod;
  utilisationReport.status = status;
  utilisationReport.dateUploaded = new Date();
  utilisationReport.uploadedByUserId = portalUser._id.toString();
  utilisationReport.updateLastUpdatedBy(requestSource);

  const azureFileInfo = new AzureFileInfoEntity();

  azureFileInfo.folder = MOCK_AZURE_FILE_INFO.folder;
  azureFileInfo.filename = MOCK_AZURE_FILE_INFO.filename;
  azureFileInfo.fullPath = MOCK_AZURE_FILE_INFO.fullPath;
  azureFileInfo.url = MOCK_AZURE_FILE_INFO.url;
  azureFileInfo.mimetype = MOCK_AZURE_FILE_INFO.mimetype;
  azureFileInfo.updateLastUpdatedBy(requestSource);

  utilisationReport.azureFileInfo = azureFileInfo;

  return utilisationReport;
};

export const createFeeRecordsForReport = (): FeeRecordEntity[] => {
  const feeRecordWithMatchingCurrencies = createFeeRecord({
    facilityId: '12345678',
    exporter: 'Test exporter',
    baseCurrency: 'GBP',
    facilityUtilisation: 1000000,
    totalFeesAccruedForThePeriod: 100,
    feesPaidToUkefForThePeriod: 50,
  });

  const feeRecordWithDifferingCurrencies = createFeeRecord({
    facilityId: '22345678',
    exporter: 'Test exporter 2',
    baseCurrency: 'GBP',
    facilityUtilisation: 200000,
    totalFeesAccruedForThePeriod: 150,
    feesPaidToUkefForThePeriod: 100,
    feesPaidToUkefForThePeriodCurrency: 'EUR',
    paymentCurrency: 'GBP',
    paymentExchangeRate: 1.1,
  });

  return [feeRecordWithMatchingCurrencies, feeRecordWithDifferingCurrencies];
};
