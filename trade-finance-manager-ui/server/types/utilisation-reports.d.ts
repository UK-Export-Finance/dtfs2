import { IsoDateTimeStamp } from './date';
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
};

type ReportId = {
  id: string;
};

type ReportDetails = {
  bankId: string;
  month: number;
  year: number;
};

export type ReportIdentifier = ReportId | ReportDetails;

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  report: ReportIdentifier;
};
