import { ValuesOf } from './types-helper';
import { MonthAndYear } from './date';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, UTILISATION_REPORT_HEADERS, FEE_RECORD_STATUS } from '../constants';
import { Currency } from './currency';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: number;
};

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

export type UtilisationReportRawCsvData = {
  [HeaderKey in UtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};

export type FeeRecordStatus = ValuesOf<typeof FEE_RECORD_STATUS>;

export type UploadedByUserDetails = {
  id: string;
  firstname: string;
  surname: string;
};
