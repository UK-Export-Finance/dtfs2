import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: string;
};
