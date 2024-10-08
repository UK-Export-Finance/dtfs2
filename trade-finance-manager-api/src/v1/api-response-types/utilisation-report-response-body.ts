import { AzureFileInfo, IsoDateTimeStamp, ReportPeriod, UploadedByUserDetails, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';

export type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  status: UtilisationReportReconciliationStatus;
  reportPeriod: ReportPeriod;
} & (
  | {
      uploadedByUser: UploadedByUserDetails;
      azureFileInfo: AzureFileInfo;
      dateUploaded: IsoDateTimeStamp;
    }
  | {
      uploadedByUser: null;
      azureFileInfo: null;
      dateUploaded: null;
    }
);
