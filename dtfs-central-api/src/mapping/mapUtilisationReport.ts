import { AzureFileInfo, AzureFileInfoEntity, ReportPeriod, ReportPeriodPartialEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { GetUtilisationReportResponse } from '../types/utilisation-reports';

const mapReportPeriodEntityToReportPeriod = (reportPeriodEntity: ReportPeriodPartialEntity): ReportPeriod => ({
  start: {
    month: reportPeriodEntity.start.month,
    year: reportPeriodEntity.start.year,
  },
  end: {
    month: reportPeriodEntity.end.month,
    year: reportPeriodEntity.end.year,
  },
});

const mapAzureFileInfoEntityToAzureFileInfo = (fileInfoEntity: AzureFileInfoEntity): AzureFileInfo => ({
  filename: fileInfoEntity.filename,
  fullPath: fileInfoEntity.fullPath,
  folder: fileInfoEntity.folder,
  url: fileInfoEntity.url,
  mimetype: fileInfoEntity.mimetype,
});

export const mapUtilisationReportEntityToGetUtilisationReportResponse = (reportEntity: UtilisationReportEntity): GetUtilisationReportResponse => ({
  bankId: reportEntity.bankId,
  id: reportEntity.id,
  status: reportEntity.status,
  uploadedByUserId: reportEntity.status,
  reportPeriod: mapReportPeriodEntityToReportPeriod(reportEntity.reportPeriod),
  azureFileInfo: reportEntity.azureFileInfo ? mapAzureFileInfoEntityToAzureFileInfo(reportEntity.azureFileInfo) : null,
  dateUploaded: reportEntity.dateUploaded,
});
