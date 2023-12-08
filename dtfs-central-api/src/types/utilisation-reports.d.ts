import { ObjectId } from 'mongodb';

export type UtilisationReportReconciliationStatus =
  | 'REPORT_NOT_RECEIVED'
  | 'PENDING_RECONCILIATION'
  | 'RECONCILIATION_IN_PROGRESS'
  | 'RECONCILIATION_COMPLETED';

export type UtilisationReportReconciliationSummaryItem = {
  reportId?: ObjectId;
};

export type ReportDetails = {
  month: number;
  year: number;
  bankId: string;
};

type ReportId = {
  id: string;
};

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  report: ReportDetails | ReportId;
};

export type ReportFilterWithReportId = {
  _id: ObjectId;
};

export type ReportFilterWithBankId = {
  month: number;
  year: number;
  'bank.id': string;
};

export type ReportFilter = ReportFilterWithReportId | ReportFilterWithBankId;

export type UpdateUtilisationReportStatusInstructions = {
  status: UtilisationReportReconciliationStatus;
  filter: ReportFilter;
};
