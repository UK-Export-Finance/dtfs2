import {
  AzureFileInfo as MongoAzureFileInfo,
  UtilisationData as MongoUtilisationData,
  UtilisationReport as MongoUtilisationReport,
  AzureFileInfoEntity,
  UtilisationDataEntity,
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

const toSqlUtilisationData = (mongoReportData: MongoUtilisationData): UtilisationDataEntity => {
  const reportData = new UtilisationDataEntity();

  reportData.facilityId = mongoReportData.facilityId;
  reportData.exporter = mongoReportData.exporter;
  reportData.baseCurrency = mongoReportData.baseCurrency;
  reportData.facilityUtilisation = mongoReportData.facilityUtilisation;

  reportData.totalFeesAccruedForTheMonth = mongoReportData.totalFeesAccruedForTheMonth;
  reportData.totalFeesAccruedForTheMonthCurrency = mongoReportData.totalFeesAccruedForTheMonthCurrency ?? mongoReportData.baseCurrency;
  reportData.totalFeesAccruedForTheMonthExchangeRate = mongoReportData.totalFeesAccruedForTheMonthExchangeRate ?? 1;

  reportData.monthlyFeesPaidToUkef = mongoReportData.monthlyFeesPaidToUkef;
  reportData.monthlyFeesPaidToUkefCurrency = mongoReportData.monthlyFeesPaidToUkefCurrency;

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
  report.data = mongoReportData.map(toSqlUtilisationData);

  return report;
};
