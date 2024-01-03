import { ObjectId } from 'mongodb';
import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';

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

export type ReportDetails = {
  month: number;
  year: number;
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

export type ReportFilterWithBankId = {
  month: number;
  year: number;
  'bank.id': string;
};

export type ReportFilter = ReportFilterWithReportId | ReportFilterWithBankId;

export type UpdateUtilisationReportStatusInstructions = {
  status: UtilisationReportReconciliationStatus;
  filter: ReportFilter;
};
