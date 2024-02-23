import { UTILISATION_REPORT_RECONCILIATION_STATUS } from 'src/constants';
import { MonthAndYear } from './date';
import { ValuesOf } from './types-helper';

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;
