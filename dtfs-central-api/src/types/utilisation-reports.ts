import { ObjectId } from 'mongodb';
import { ValuesOf } from './types-helper';
import { IsoMonthStamp, MonthAndYear, OneIndexedMonth } from './date';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, UTILISATION_REPORT_HEADERS } from '../constants';
import { Currency } from './currency';

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

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

export type ReportDetails = MonthAndYear & {
  bankId: string;
};

export type ReportId = {
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
  'bank.id': string;
  'reportPeriod.start.month': OneIndexedMonth;
  'reportPeriod.start.year': number;
};

export type ReportFilter = ReportFilterWithReportId | ReportFilterWithBankId;

export type UpdateUtilisationReportStatusInstructions = {
  status: UtilisationReportReconciliationStatus;
  filter: ReportFilter;
};

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

export type UtilisationReportRawCsvData = {
  [HeaderKey in UtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};
