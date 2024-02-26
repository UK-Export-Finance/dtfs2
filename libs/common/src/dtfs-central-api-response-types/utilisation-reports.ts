import { UtilisationReportReconciliationStatus, ReportPeriod, IsoDateTimeStamp, AzureFileInfo } from '..';

export type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  azureFileInfo: AzureFileInfo | null;
  status: UtilisationReportReconciliationStatus;
  uploadedByUserId: string | null;
};
