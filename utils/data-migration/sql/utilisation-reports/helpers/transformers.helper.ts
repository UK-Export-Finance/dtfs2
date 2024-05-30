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
  fileInfo.updateLastUpdatedBy({ platform: 'SYSTEM' });

  return fileInfo;
};

const toSqlFeeRecord =
  (report: UtilisationReportEntity) =>
  (mongoReportData: MongoUtilisationData): FeeRecordEntity => {
    const feeRecord = new FeeRecordEntity();

    feeRecord.report = report;

    feeRecord.facilityId = mongoReportData.facilityId;
    feeRecord.exporter = mongoReportData.exporter;
    feeRecord.baseCurrency = mongoReportData.baseCurrency;
    feeRecord.facilityUtilisation = mongoReportData.facilityUtilisation;

    feeRecord.totalFeesAccruedForThePeriod = mongoReportData.totalFeesAccruedForTheMonth;
    feeRecord.totalFeesAccruedForThePeriodCurrency = mongoReportData.totalFeesAccruedForTheMonthCurrency ?? mongoReportData.baseCurrency;
    feeRecord.totalFeesAccruedForThePeriodExchangeRate = mongoReportData.totalFeesAccruedForTheMonthExchangeRate ?? 1;

    feeRecord.feesPaidToUkefForThePeriod = mongoReportData.monthlyFeesPaidToUkef;
    feeRecord.feesPaidToUkefForThePeriodCurrency = mongoReportData.monthlyFeesPaidToUkefCurrency;

    feeRecord.paymentCurrency = mongoReportData.paymentCurrency ?? mongoReportData.monthlyFeesPaidToUkefCurrency;
    feeRecord.paymentExchangeRate = mongoReportData.paymentExchangeRate ?? 1;

    feeRecord.updateLastUpdatedBy({ platform: 'SYSTEM' });

    return feeRecord;
  };

export const toSqlUtilisationReport = ({
  mongoReport,
  mongoReportData,
}: {
  mongoReport: MongoUtilisationReport;
  mongoReportData: MongoUtilisationData[];
}): {
  sqlReport: UtilisationReportEntity;
  sqlFeeRecords: FeeRecordEntity[];
} => {
  const sqlReport = new UtilisationReportEntity();

  sqlReport.bankId = mongoReport.bank.id;
  sqlReport.reportPeriod = mongoReport.reportPeriod;
  sqlReport.dateUploaded = mongoReport.dateUploaded ?? null;
  sqlReport.status = mongoReport.status;
  sqlReport.uploadedByUserId = mongoReport.uploadedBy?.id ?? null;
  sqlReport.updateLastUpdatedBy({ platform: 'SYSTEM' });

  // Cascaded child entities
  sqlReport.azureFileInfo = toSqlAzureFileInfo(mongoReport.azureFileInfo);
  const sqlFeeRecords = mongoReportData.map(toSqlFeeRecord(sqlReport));

  return { sqlReport, sqlFeeRecords };
};
