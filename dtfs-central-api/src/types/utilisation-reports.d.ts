import { ObjectId } from 'mongodb';
import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';
import { IsoMonthStamp } from './date';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type UtilisationReportReconciliationSummaryItem = {
  reportId?: ObjectId;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  dateUploaded?: Date;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
  isPlaceholderReport?: boolean;
};

export type UtilisationReportReconciliationSummary = {
  submissionMonth: IsoMonthStamp;
  items: UtilisationReportReconciliationSummaryItem[];
};

export type ReportPeriodStart = {
  month: number; // 1-indexed
  year: number;
};

export type ReportDetails = ReportPeriodStart & {
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

export type ReportFilterWithBankId = ReportPeriodStart & {
  'bank.id': string;
};

export type ReportFilter = ReportFilterWithReportId | ReportFilterWithBankId;

export type UpdateUtilisationReportStatusInstructions = {
  status: UtilisationReportReconciliationStatus;
  filter: ReportFilter;
};
