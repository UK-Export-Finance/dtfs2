import {
  AzureFileInfo as MongoAzureFileInfo,
  UtilisationData as MongoUtilisationData,
  UtilisationReport as MongoUtilisationReport,
  AzureFileInfoEntity,
  FeeRecordEntity,
  UtilisationReportEntity,
} from '@ukef/dtfs2-common';

const toSqlAzureFileInfo = (mongoAzureFileInfo: MongoAzureFileInfo | null): AzureFileInfoEntity | undefined => {
  if (!mongoAzureFileInfo) {
    return undefined;
  }

  const fileInfo = new AzureFileInfoEntity();

  fileInfo.folder = mongoAzureFileInfo.folder;
  fileInfo.filename = mongoAzureFileInfo.filename;
  fileInfo.fullPath = mongoAzureFileInfo.fullPath;
  fileInfo.url = mongoAzureFileInfo.url;
  fileInfo.mimetype = mongoAzureFileInfo.mimetype;
  fileInfo.updatedByUserId = 'SYSTEM';

  return fileInfo;
};

const toSqlUtilisationData = (mongoReportData: MongoUtilisationData): FeeRecordEntity => {
  const reportData = new FeeRecordEntity();

  reportData.facilityId = mongoReportData.facilityId;
  reportData.exporter = mongoReportData.exporter;
  reportData.baseCurrency = mongoReportData.baseCurrency;
  reportData.facilityUtilisation = mongoReportData.facilityUtilisation;

  reportData.totalFeesAccruedForThePeriod = mongoReportData.totalFeesAccruedForTheMonth;
  reportData.totalFeesAccruedForThePeriodCurrency = mongoReportData.totalFeesAccruedForTheMonthCurrency ?? mongoReportData.baseCurrency;
  reportData.totalFeesAccruedForThePeriodExchangeRate = mongoReportData.totalFeesAccruedForTheMonthExchangeRate ?? 1;

  reportData.feesPaidToUkefForThePeriod = mongoReportData.monthlyFeesPaidToUkef;
  reportData.feesPaidToUkefForThePeriodCurrency = mongoReportData.monthlyFeesPaidToUkefCurrency;

  reportData.paymentCurrency = mongoReportData.paymentCurrency ?? mongoReportData.monthlyFeesPaidToUkefCurrency;
  reportData.paymentExchangeRate = mongoReportData.paymentExchangeRate ?? 1;

  reportData.updatedByUserId = 'SYSTEM';

  return reportData;
};

export const toSqlUtilisationReport = ({
  mongoReport,
  mongoReportData,
}: {
  mongoReport: MongoUtilisationReport;
  mongoReportData: MongoUtilisationData[];
}): UtilisationReportEntity => {
  const report = new UtilisationReportEntity();

  report.bankId = mongoReport.bank.id;
  report.reportPeriod = mongoReport.reportPeriod;
  report.dateUploaded = mongoReport.dateUploaded ?? null;
  report.status = mongoReport.status;
  report.uploadedByUserId = mongoReport.uploadedBy?.id ?? null;
  report.updatedByUserId = 'SYSTEM';

  // Cascaded child entities
  report.azureFileInfo = toSqlAzureFileInfo(mongoReport.azureFileInfo);
  report.feeRecords = mongoReportData.map(toSqlUtilisationData);

  return report;
};
