import { AzureFileInfo, IsoDateTimeStamp, ReportPeriod, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';

export type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  status: UtilisationReportReconciliationStatus;
  uploadedByUserId: string;
  reportPeriod: ReportPeriod;
  azureFileInfo: AzureFileInfo | null;
  dateUploaded: IsoDateTimeStamp;
};
