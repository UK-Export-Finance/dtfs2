import { ObjectId } from 'mongodb';
import { TFMUser } from './users';

export type ReportStatus = 'RECONCILIATION_COMPLETED' | 'REPORT_NOT_RECEIVED';

export type ReportDetails = {
  month: number;
  year: number;
  bankId: string;
};

type ReportId = {
  id: string;
};

type ReportWithStatus = {
  status: ReportStatus;
  report: ReportDetails | ReportId;
};

export type PutReportStatusRequestBody = {
  user: TFMUser;
  reportsWithStatus: ReportWithStatus[];
};

export type ReportFilter =
  | { _id: ObjectId }
  | {
      month: number;
      year: number;
      'bank.id': string;
    };

export type UtilisationReport = {
  bank: {
    id: string;
    name?: string;
  };
  month: number;
  year: number;
  azureFileInfo: {
    fullPath: string;
  } | null;
  dateUploaded: Date;
  uploadedBy: TFMUser;
};
