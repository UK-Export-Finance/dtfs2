import { IsoDateTimeStamp, IsoMonthStamp, OneIndexedMonth } from './date';
import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type UtilisationReportReconciliationSummaryItem = {
  reportId?: string;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  dateUploaded?: IsoDateTimeStamp;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
  isPlaceholderReport?: boolean;
};

export type UtilisationReportReconciliationSummary = {
  submissionMonth: IsoMonthStamp;
  items: UtilisationReportReconciliationSummaryItem[];
};

export type ReportPeriodStart = {
  month: OneIndexedMonth;
  year: number;
};

type ReportId = {
  id: string;
};

type ReportDetails = ReportPeriodStart & {
  bankId: string;
};

export type ReportIdentifier = ReportId | ReportDetails;

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  report: ReportIdentifier;
};
