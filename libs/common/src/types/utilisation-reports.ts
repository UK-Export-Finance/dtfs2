import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';
import { MonthAndYear } from './date';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};
