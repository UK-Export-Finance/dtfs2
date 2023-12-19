import { IsoDateTimeStamp } from './date';

type UtilisationReportReconciliationStatus = 'REPORT_NOT_RECEIVED' | 'PENDING_RECONCILIATION' | 'RECONCILIATION_IN_PROGRESS' | 'RECONCILIATION_COMPLETED';

type AzureFileInfo = {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};

export type UtilisationReportResponseBody = {
  _id: string;
  bank: {
    id: string;
    name: string;
  };
  month: number;
  year: number;
  dateUploaded: IsoDateTimeStamp;
  azureFileInfo: AzureFileInfo | null;
  status: UtilisationReportReconciliationStatus;
  uploadedBy: {
    id: string;
    firstname: string;
    surname: string;
  };
};
