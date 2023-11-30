import { ObjectId } from 'mongodb';

export type ReportStatus = 'PENDING_RECONCILIATION' | 'REPORT_NOT_RECEIVED';

export interface ReportDetails {
  month: number;
  year: number;
  bankId: string;
}

interface ReportId {
  id: string;
}

type ReportWithStatus = {
  status: ReportStatus;
  report: ReportDetails | ReportId;
};

export interface PutReportStatusRequestBody {
  reportsWithStatus: ReportWithStatus[];
}

export type ReportFilter =
  | { _id: ObjectId }
  | {
      month: number;
      year: number;
      'bank.id': string;
    };

export type PlaceholderUtilisationReport = {
  month: number;
  year: number;
  bank: {
    id: string;
  };
  azureFileInfo: undefined;
};
