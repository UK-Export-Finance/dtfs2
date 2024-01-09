import { ObjectId } from 'mongodb';
import { ValuesOf } from './types-helper';
import { IsoMonthStamp, OneIndexedMonth } from './date';
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

export type ReportPeriodStart = {
  month: OneIndexedMonth;
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

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

export type UtilisationReportRawCsvData = {
  [HeaderKey in UtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};
