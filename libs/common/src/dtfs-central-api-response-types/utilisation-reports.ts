import { UtilisationReportReconciliationStatus, ReportPeriod, IsoDateTimeStamp } from '..';

export type AzureFileInfo = {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};

export type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  azureFileInfo: AzureFileInfo | null;
  status: UtilisationReportReconciliationStatus;
  uploadedByUserId: string | null;
};
