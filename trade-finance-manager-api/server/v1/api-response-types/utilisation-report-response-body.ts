import { AzureFileInfo, IsoDateTimeStamp, ReportPeriod, UploadedByUserDetails, UtilisationReportStatus } from '@ukef/dtfs2-common';

export type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  status: UtilisationReportStatus;
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
