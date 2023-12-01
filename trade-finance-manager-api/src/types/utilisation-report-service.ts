import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants/utilisation-report-reconciliation-status';
import { ValuesOf } from './types-helper';

export type UtilisationReportStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

type ReportId = {
  id: string;
};

type ReportDetails = {
  month: number;
  year: number;
  bankId: string;
};

export type ReportIdentifier = ReportId | ReportDetails;

export type ReportWithStatus = {
  status: UtilisationReportStatus;
  report: ReportIdentifier;
};
