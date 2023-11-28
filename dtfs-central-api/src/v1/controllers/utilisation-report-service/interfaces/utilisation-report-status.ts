export const enum ReportStatus {
  PENDING_RECONCILIATION = 'PENDING_RECONCILIATION',
  REPORT_NOT_RECEIVED = 'REPORT_NOT_RECEIVED',
};

export interface ReportDetails {
  month: number;
  year: number;
  bankId: string;
};

interface ReportId {
  id: string;
};

type ReportWithStatus = {
  status: ReportStatus;
  report: ReportDetails | ReportId;
};

export interface PutReportStatusRequestBody {
  reportsWithStatus: ReportWithStatus[];
};

export type ReportFilter = ReportId | {
  month: number;
  year: number;
  'bank.id': string;
};
