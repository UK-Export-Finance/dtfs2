import { ValuesOf } from './types-helper';
import { MonthAndYear } from './date';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type AzureFileInfo = {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};
